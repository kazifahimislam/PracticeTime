import React, { useState, useEffect } from 'react';
import './Quiz.css';
import PracticeTime from '../../assets/practiceTime.jpg';

import { getAuth } from 'firebase/auth';
import firebaseServices from '../firebase/firebaseSetup';

const Quiz = () => {
  const { auth, provider, db, ref, set, get, child } = firebaseServices;
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentSet, setCurrentSet] = useState(null);
  const [userResponses, setUserResponses] = useState([]);
  const [error, setError] = useState(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (user) {
          // Get user's assigned sets
          const userRef = ref(db, `users/${user.uid}/assignedSets`);
          const userSnapshot = await get(userRef);
          
          if (userSnapshot.exists()) {
            const assignedSets = userSnapshot.val();
            // Get the first set ID - in your structure this might be "20250228"
            const setId = Object.keys(assignedSets)[0];
            setCurrentSet(setId);
            
            // Now fetch all the question IDs for this set from attachedQuestionSets
            const setRef = ref(db, `attachedQuestionSets/${setId}`);
            const setSnapshot = await get(setRef);
            
            if (setSnapshot.exists()) {
              const setData = setSnapshot.val();
              // Based on Image 2, the structure has question IDs as object keys
              // We need to extract these IDs
              const questionIds = Object.keys(setData).map(key => key);
              
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
              setError("No questions found in this set");
            }
          } else {
            setError("No assigned sets found for this user");
          }
        } else {
          setError("User not authenticated");
        }
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        setError(`Error loading quiz: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, []);

  const handleNextQuestion = () => {
    // Save the current answer to user responses
    const currentAnswer = selectedAnswers[currentQuestionIndex];
    const updatedResponses = [...userResponses];
    updatedResponses[currentQuestionIndex] = {
      questionId: questions[currentQuestionIndex].id,
      userAnswer: currentAnswer,
      correctAnswer: questions[currentQuestionIndex].correctAnswer,
      isCorrect: isAnswerCorrect(currentAnswer, questions[currentQuestionIndex].correctAnswer)
    };
    setUserResponses(updatedResponses);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Handle quiz completion
      handleQuizComplete(updatedResponses);
    }
  };

  const isAnswerCorrect = (userAnswer, correctAnswer) => {
    // Handle different ways correctAnswer might be stored
    if (typeof correctAnswer === 'string') {
      return userAnswer?.toLowerCase() === correctAnswer.toLowerCase();
    } else if (Array.isArray(correctAnswer)) {
      return correctAnswer.some(answer => 
        userAnswer?.toLowerCase() === answer.toLowerCase()
      );
    } else if (correctAnswer && typeof correctAnswer === 'object' && correctAnswer.text) {
      return userAnswer?.toLowerCase() === correctAnswer.text.toLowerCase();
    }
    return false;
  };

  const calculateResults = (responses) => {
    const totalQuestions = responses.length;
    const correctAnswers = responses.filter(response => response.isCorrect).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
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
      responses
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
        const resultsRef = ref(db, `users/${user.uid}/quizResults/${currentSet}`);
        await set(resultsRef, {
          completedAt: new Date().toISOString(),
          score: results.score,
          correctAnswers: results.correctAnswers,
          totalQuestions: results.totalQuestions,
          responses: responses
        });
        
        console.log("Quiz completed and results saved!", results);
      }
    } catch (error) {
      console.error("Error saving quiz results:", error);
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

  const handleRetakeQuiz = () => {
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setUserResponses(new Array(questions.length).fill(null));
    setQuizResults(null);
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
          <button onClick={() => window.location.reload()} className="retryButton">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="quizContainer">
        <p className="noQuestionsMessage">No questions found for this quiz.</p>
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
          {quizResults.responses.map((response, index) => (
            <div 
              key={index} 
              className={`reviewItem ${response.isCorrect ? 'correct' : 'incorrect'}`}
            >
              <div className="reviewHeader">
                <span className="questionNumber">Question {index + 1}</span>
                <span className={`statusBadge ${response.isCorrect ? 'correctBadge' : 'incorrectBadge'}`}>
                  {response.isCorrect ? 'Correct' : 'Incorrect'}
                </span>
              </div>
              <p className="reviewQuestion">{questions[index].question}</p>
              <div className="answerDetail">
                <p><strong>Your answer:</strong> {response.userAnswer || '(No answer)'}</p>
                <p><strong>Correct answer:</strong> {
                  typeof response.correctAnswer === 'object' 
                    ? response.correctAnswer.text 
                    : response.correctAnswer
                }</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="actionButtons">
          <button onClick={handleRetakeQuiz} className="retakeButton">
            Retake Quiz
          </button>
          <button onClick={() => window.location.href = '/'} className="homeButton">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasSelectedAnswer = selectedAnswers[currentQuestionIndex] !== undefined;
  
  // Calculate progress percentage
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className='quizContainer'>
      <div className="progressBarContainer">
        <div 
          className="progressBar" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className='quizIndex'>
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>
      
      {/* Display difficulty level and grade if available */}
      {currentQuestion.difficultyLevel && (
        <div className="questionMetadata">
          <span className="difficultyLevel">Level: {currentQuestion.difficultyLevel}</span>
          {currentQuestion.grade && <span className="grade">Grade: {currentQuestion.grade}</span>}
        </div>
      )}
      
      {/* Display question image if available */}
      {currentQuestion.questionImage ? (
        <img src={currentQuestion.questionImage} alt="Question" className="questionImage" />
      ) : (
        <img src={PracticeTime} alt="Quiz illustration" className="defaultImage" />
      )}
      
      <div className="questionContainer">
        <h2 className="questionText">{currentQuestion.question}</h2>
        
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
        ) : (
          <ul className="optionsList">
            {currentQuestion.options && currentQuestion.options.map((option, index) => (
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
        )}
      </div>
      
      <button 
        onClick={handleNextQuestion}
        disabled={!hasSelectedAnswer}
        className="nextButton"
      >
        {isLastQuestion ? 'Finish Quiz' : 'Next'}
      </button>
    </div>
  );
};

export default Quiz;