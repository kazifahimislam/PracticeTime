import React, { useState, useEffect } from 'react';
import './Quiz.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import firebaseServices from '../firebase/firebaseSetup';
import practiceTime from '../../assets/practiceTime.jpg';

const Quiz = () => {
  const { auth, provider, db, ref, set, get, child } = firebaseServices;
  
  // Get selectedQuizSet from localStorage instead of router state
  const [selectedQuizSet, setSelectedQuizSet] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentSet, setCurrentSet] = useState(null);
  const [userResponses, setUserResponses] = useState([]);
  const [error, setError] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [verifying, setVerifying] = useState(false);

  //gemini api key
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Get quiz set from localStorage on component mount
  useEffect(() => {
    const storedQuizSet = localStorage.getItem('selectedQuizSet');
    if (storedQuizSet) {
      setSelectedQuizSet(storedQuizSet);
    } else {
      setError("No quiz set selected");
    }
  }, []);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        if (!selectedQuizSet) {
          return; // Wait until selectedQuizSet is loaded
        }
        
        setLoading(true);
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
          setError("User not authenticated");
          return;
        }
        
        // Set the current quiz set
        setCurrentSet(selectedQuizSet);
        
        // Fetch question IDs for this specific set
        const setRef = ref(db, `attachedQuestionSets/${selectedQuizSet}`);
        const setSnapshot = await get(setRef);
        
        if (setSnapshot.exists()) {
          const setData = setSnapshot.val();
          // Extract question IDs from the set data
          const questionIds = Object.keys(setData);
          
          // Fetch each question
          const questionPromises = questionIds.map(id => 
            get(ref(db, `questions/${id}`))
          );
          
          const questionSnapshots = await Promise.all(questionPromises);
          const loadedQuestions = questionSnapshots
            .filter(snap => snap.exists())
            .map(snap => ({
              id: snap.key,
              ...snap.val()
            }));
          
          setQuestions(loadedQuestions);
          
          // Initialize empty user responses array
          setUserResponses(new Array(loadedQuestions.length).fill(null));
        } else {
          setError(`No questions found in set: ${selectedQuizSet}`);
        }
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        setError(`Error loading quiz: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [selectedQuizSet, db]);

  // Enhanced normalization function
  const normalizeAnswer = (answer) => {
    if (answer === null || answer === undefined) return '';
    
    // Convert to string, trim whitespace, and convert to lowercase
    let normalized = String(answer).trim().toLowerCase();
    
    // Remove extra spaces, punctuation and special characters
    normalized = normalized.replace(/\s+/g, ' ');
    normalized = normalized.replace(/[.,;:!?'"()\[\]{}]/g, '');
    
    // Handle numeric values (e.g., "1" and 1 should match)
    if (!isNaN(normalized) && !isNaN(parseFloat(normalized))) {
      normalized = parseFloat(normalized).toString();
    }
    
    // Common word replacements for numbers
    const numberWords = {
      'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
      'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
      'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13', 'fourteen': '14',
      'fifteen': '15', 'sixteen': '16', 'seventeen': '17', 'eighteen': '18', 'nineteen': '19',
      'twenty': '20'
    };
    
    // Check if the answer is a number word and replace it
    if (numberWords[normalized]) {
      normalized = numberWords[normalized];
    }
    
    return normalized;
  };

  // Enhanced fallback verification with better normalization
  const fallbackVerification = (userAnswer, correctAnswer) => {
    console.log("Using fallback verification method");
    
    // Normalize user answer
    const normalizedUserAnswer = normalizeAnswer(userAnswer);
    
    // Handle different ways correctAnswer might be stored
    if (typeof correctAnswer === 'string') {
      return normalizedUserAnswer === normalizeAnswer(correctAnswer);
    } else if (Array.isArray(correctAnswer)) {
      // Check if any of the correct answers match
      return correctAnswer.some(answer => 
        normalizedUserAnswer === normalizeAnswer(answer)
      );
    } else if (correctAnswer && typeof correctAnswer === 'object' && correctAnswer.text) {
      return normalizedUserAnswer === normalizeAnswer(correctAnswer.text);
    }
    
    return false;
  };

  // Enhanced verification function with better prompt engineering and fallback handling
  const verifyAnswerWithGemini = async (question, correctAnswer, userAnswer) => {
    try {
      console.log("Verifying answer with Gemini:");
      console.log("Question:", question);
      console.log("Correct answer:", correctAnswer);
      console.log("User answer:", userAnswer);

      // Handle empty user answers
      if (!userAnswer || userAnswer.trim() === '') {
        console.log("Empty user answer, marking as incorrect");
        return false;
      }

      // Format correctAnswer for the prompt
      let formattedCorrectAnswer = correctAnswer;
      if (Array.isArray(correctAnswer)) {
        formattedCorrectAnswer = correctAnswer.join(' OR ');
      } else if (typeof correctAnswer === 'object' && correctAnswer.text) {
        formattedCorrectAnswer = correctAnswer.text;
      }

      // Create a more structured prompt for Gemini
      const prompt = `
Task: Verify if the user's answer is semantically equivalent to the correct answer.

Question: "${question}"
Correct answer: "${formattedCorrectAnswer}"
User answer: "${userAnswer}"

Instructions:
1. Compare the semantic meaning, not just exact text.
2. Ignore case, spacing, and minor punctuation differences.
3. Recognize numerical equivalence (e.g., "12" and "twelve").
4. Account for synonyms and equivalent expressions.

Is the user's answer correct? Respond with ONLY "correct" or "incorrect".
`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 20
          }
        })
      });

      // Check if response is valid
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API error:", errorData);
        // Fallback to direct comparison
        return fallbackVerification(userAnswer, correctAnswer);
      }

      const data = await response.json();
      
      // Extract and validate the result
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const result = data.candidates[0].content.parts[0].text.trim().toLowerCase();
        console.log("Gemini response:", result);
        
        if (result.includes('correct') && !result.includes('incorrect')) {
          return true;
        } else if (result.includes('incorrect')) {
          return false;
        } else {
          console.log("Ambiguous Gemini response, falling back to direct comparison");
          return fallbackVerification(userAnswer, correctAnswer);
        }
      } else {
        console.error("Unexpected Gemini API response format:", data);
        return fallbackVerification(userAnswer, correctAnswer);
      }
    } catch (error) {
      console.error("Error verifying with Gemini:", error);
      return fallbackVerification(userAnswer, correctAnswer);
    }
  };

  // Legacy answer verification function (kept for backward compatibility)
  const isAnswerCorrect = (userAnswer, correctAnswer) => {
    return fallbackVerification(userAnswer, correctAnswer);
  };

  const handleNextQuestion = async () => {
    const currentAnswer = selectedAnswers[currentQuestionIndex];
    const currentQuestion = questions[currentQuestionIndex];
    
    if (!currentAnswer && currentQuestion.type !== "TRIVIA") {
      return; // Prevent proceeding without an answer for non-trivia questions
    }
    
    // Set verifying state to show loading indicator
    setVerifying(true);
    
    try {
      // Check answer using Gemini for text answers
      let isCorrect = false;
      
      if (currentQuestion.type === "FILL_IN_THE_BLANKS" && currentAnswer) {
        console.log("Verifying fill-in-the-blanks answer");
        
        isCorrect = await verifyAnswerWithGemini(
          currentQuestion.question,
          currentQuestion.correctAnswer,
          currentAnswer
        );
        
        console.log("Final verification result:", isCorrect ? "Correct" : "Incorrect");
      } else if (currentQuestion.type === "MCQ" && currentAnswer) {
        // For MCQ, use regular comparison
        isCorrect = isAnswerCorrect(currentAnswer, currentQuestion.correctAnswer);
      } else if (currentQuestion.type === "TRIVIA") {
        // Trivia questions are just for information, no correct/incorrect
        isCorrect = null;
      }
      
      // Save the current answer to user responses
      const updatedResponses = [...userResponses];
      updatedResponses[currentQuestionIndex] = {
        questionId: currentQuestion.id,
        userAnswer: currentAnswer || "(Skipped)",
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect: isCorrect,
        type: currentQuestion.type
      };
      
      setUserResponses(updatedResponses);
  
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        // Handle quiz completion
        handleQuizComplete(updatedResponses);
      }
    } catch (error) {
      console.error("Error processing answer:", error);
      setError("There was a problem processing your answer. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSkipQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Save the skipped question response
    const updatedResponses = [...userResponses];
    updatedResponses[currentQuestionIndex] = {
      questionId: currentQuestion.id,
      userAnswer: "(Skipped)",
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: false,
      skipped: true,
      type: currentQuestion.type
    };
    
    setUserResponses(updatedResponses);
    
    // Move to the next question or complete the quiz if it's the last question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Handle quiz completion
      handleQuizComplete(updatedResponses);
    }
  };

  const calculateResults = (responses) => {
    // Filter out any null responses and trivia questions
    const validResponses = responses.filter(response => 
      response !== null && response.type !== "TRIVIA"
    );
    
    // Count only non-trivia questions for scoring
    const totalQuestions = validResponses.length;
    const correctAnswers = validResponses.filter(response => response.isCorrect).length;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    
    let performance;
    if (score >= 90) performance = "Excellent";
    else if (score >= 75) performance = "Good";
    else if (score >= 60) performance = "Satisfactory";
    else performance = "Needs Improvement";
    
    return {
      totalQuestions,
      correctAnswers,
      score,
      performance,
      responses: responses.filter(r => r !== null) // Include all non-null responses including trivia
    };
  };

  const handleQuizComplete = async (responses) => {
    try {
        // Calculate the results
        const results = calculateResults(responses);
        setQuizResults(results);
        setQuizCompleted(true);

        // Save the user's responses to Firebase
        const auth = getAuth();
        const user = auth.currentUser;

        if (user && currentSet) {
            // Reference to the user's quiz sets
            const userQuizSetsRef = ref(db, `users/${user.uid}/assignedSets`);

            // Ensure responses do not contain undefined values
            const filteredResponses = responses
                .filter(r => r !== null) // Remove null responses
                .map(r => ({
                    ...r,
                    correctAnswer: r.correctAnswer ?? null, // Replace undefined with null
                    selectedAnswer: r.selectedAnswer ?? null // Replace undefined with null
                }));

            // Save quiz results
            const resultsRef = ref(db, `users/${user.uid}/quizResults/${currentSet}`);
            await set(resultsRef, {
                completedAt: new Date().toISOString(),
                score: results.score,
                correctAnswers: results.correctAnswers,
                totalQuestions: results.totalQuestions,
                selectedSet: currentSet,
                responses: filteredResponses
            });

            // Remove the completed quiz set from user's available sets
            const availableSetsSnapshot = await get(userQuizSetsRef);
            if (availableSetsSnapshot.exists()) {
                const availableSets = availableSetsSnapshot.val();

                // Remove the current set from available sets
                delete availableSets[currentSet];

                // Update the available sets
                await set(userQuizSetsRef, availableSets);
            }

            console.log("Quiz completed, results saved, and set removed!", results);
        }
    } catch (error) {
        console.error("Error saving quiz results and removing set:", error);
    }
};


  const handleAnswerSelect = (option) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    if (currentQuestion.type === "MCQ") {
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQuestionIndex]: option
      });
    }
  };

  const handleTextAnswer = (event) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: event.target.value
    });
  };
  

  const handleBackToHome = () => {
    // Use global navigate function from window object
    if (window.appNavigate) {
      window.appNavigate('start');
    }
  };

  if (loading) {
    return (
      <div className="quizContainer">
        <div className="loaderContainer">
          <div className="loader"></div>
          <p>Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quizContainer">
        <div className="errorContainer">
          <p className="errorMessage">{error}</p>
          <button onClick={handleBackToHome} className="retryButton">
            Hurray, Practice for today is Completed
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quizContainer">
        <p className="noQuestionsMessage">No questions found for this quiz set.</p>
        <button onClick={handleBackToHome} className="retryButton">
          Hurray, Practice for today is Completed
        </button>
      </div>
    );
  }

  if (quizCompleted && quizResults) {
    return (
      <div className="quizContainer resultsContainer">
        <h1 className="resultsTitle">Quiz Results</h1>
        
        <div className="scoreCard">
          <div className="scoreCircle">
            <div className="scoreValue">{quizResults.score}%</div>
          </div>
          <div className="scoreDetails">
            <h2 className="performanceText">{quizResults.performance}</h2>
            <p className="scoreText">
              You answered {quizResults.correctAnswers} out of {quizResults.totalQuestions} questions correctly.
            </p>
          </div>
        </div>
        
        <div className="questionReview">
          <h2>Question Review</h2>
          {quizResults.responses.map((response, index) => {
            // Find the corresponding question
            const question = questions.find(q => q.id === response.questionId) || 
                             questions[index];
            
            // Skip showing trivia questions in review
            if (response.type === "TRIVIA") {
              return null;
            }
                             
            return (
              <div 
                key={index} 
                className={`reviewItem ${response.skipped ? 'skipped' : (response.isCorrect ? 'correct' : 'incorrect')}`}
              >
                <div className="reviewHeader">
                  <span className="questionNumber">Question {index + 1}</span>
                  <span className={`statusBadge ${response.skipped ? 'skippedBadge' : (response.isCorrect ? 'correctBadge' : 'incorrectBadge')}`}>
                    {response.skipped ? 'Skipped' : (response.isCorrect ? 'Correct' : 'Incorrect')}
                  </span>
                </div>
                <p className="reviewQuestion">{question ? question.question : 'Question not found'}</p>
                <div className="answerDetail">
                  <p><strong>Your answer:</strong> {response.userAnswer || '(No answer)'}</p>
                  <p><strong>Correct answer:</strong> {
                    Array.isArray(response.correctAnswer) ? 
                      response.correctAnswer.join(', ') : 
                      (typeof response.correctAnswer === 'object' && response.correctAnswer.text) ? 
                        response.correctAnswer.text : 
                        response.correctAnswer
                  }</p>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="actionButtons">
          <button onClick={handleBackToHome} className="homeButton">
            Hurray, Practice for today is Completed
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasSelectedAnswer = selectedAnswers[currentQuestionIndex] !== undefined;
  const isTriviaQuestion = currentQuestion.type === "TRIVIA";
  
  // Calculate progress percentage
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className='quizContainer'>
      <img src={practiceTime} alt="" />
     
      <div className="progressBarContainer">
        <div 
          className="progressBar" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className='quizIndex'>
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>
      
      {/* Display question image if available */}
      {currentQuestion.questionImage ? (
        <img src={currentQuestion.questionImage} alt="Question" className="questionImage" />
      ) : null}
      
      <div className="questionContainer">
        <h2 className="questionText">
          {/* Display question type as a badge for trivia */}
          {isTriviaQuestion && <span className="triviaTag">Trivia</span>}
          {currentQuestion.question}
        </h2>
        
        {currentQuestion.type === "FILL_IN_THE_BLANKS" ? (
          <div className="fillBlankContainer">
            <input
              type="text"
              placeholder="Type your answer here"
              value={selectedAnswers[currentQuestionIndex] || ''}
              onChange={handleTextAnswer}
              className="fillBlankInput"
            />
          </div>
        ) : currentQuestion.type === "MCQ" ? (
          <ul className="optionsList">
            {/* Only display options that exist */}
            {currentQuestion.options && currentQuestion.options
              .filter(option => option && option.text) // Only include valid options
              .map((option, index) => (
                <li 
                  key={index}
                  className={`optionItem ${selectedAnswers[currentQuestionIndex] === option.text ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(option.text)}
                >
                  {option.image && (
                    <img src={option.image} alt={`Option ${index + 1}`} className="optionImage" />
                  )}
                  <span className="optionText">{option.text}</span>
                </li>
              ))}
          </ul>
        ) : (
          // Trivia display - just show the information
          <div className="triviaContainer">
            {currentQuestion.content && (
              <div className="triviaContent">
                {currentQuestion.content}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="buttonContainer">
        <button 
          onClick={handleNextQuestion}
          disabled={!isTriviaQuestion && !hasSelectedAnswer && verifying}
          className={`nextButton ${verifying ? 'verifying' : ''}`}
        >
          {verifying ? 'Verifying...' : isLastQuestion ? 'Complete PracticeSheet' : 'Next'}
        </button>
        
        {/* Skip button - only show for non-trivia questions */}
        {!isTriviaQuestion && (
          <button 
            onClick={handleSkipQuestion}
            className="skipButton"
            disabled={verifying}
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;