import React, { useState, useEffect } from 'react';
import firebaseServices from '../firebase/firebaseSetup';
import './Progress.css';

const MATH_DATA = {
  grades: [
    { code: "G1", text: "Grade 1" },
    { code: "G2", text: "Grade 2" },
    { code: "G3", text: "Grade 3" },
    { code: "G4", text: "Grade 4" },
  ],
  topics: [
    { grade: "G1", code: "G1A", text: "Number System" },
    { grade: "G2", code: "G2A", text: "Number System" },
    { grade: "G3", code: "G3A", text: "Number System" },
    { grade: "G4", code: "G4A", text: "Number System" },
    { grade: "G1", code: "G1B", text: "Operations (Addition, Subtraction ....)" },
    { grade: "G2", code: "G2B", text: "Operations (Addition, Subtraction ....)" },
    { grade: "G3", code: "G3B", text: "Operations (Addition, Subtraction ....)" },
    { grade: "G4", code: "G4B", text: "Operations (Addition, Subtraction ....)" },
    { grade: "G1", code: "G1C", text: "Shapes and Geometry" },
    { grade: "G2", code: "G2C", text: "Shapes and Geometry" },
    { grade: "G3", code: "G3C", text: "Shapes and Geometry" },
    { grade: "G4", code: "G4C", text: "Shapes and Geometry" },
    { grade: "G1", code: "G1D", text: "Measurement" },
    { grade: "G2", code: "G2D", text: "Measurement" },
    { grade: "G3", code: "G3D", text: "Measurement" },
    { grade: "G4", code: "G4D", text: "Measurement" },
    { grade: "G1", code: "G1E", text: "Data Handling" },
    { grade: "G2", code: "G2E", text: "Data Handling" },
    { grade: "G3", code: "G3E", text: "Data Handling" },
    { grade: "G4", code: "G4E", text: "Data Handling" },
    { grade: "G1", code: "G1F", text: "Maths Puzzles" },
    { grade: "G2", code: "G2F", text: "Maths Puzzles" },
    { grade: "G3", code: "G3F", text: "Maths Puzzles" },
    { grade: "G4", code: "G4F", text: "Maths Puzzles" },
    { grade: "G1", code: "G1G", text: "Real Life all concept sums" },
    { grade: "G2", code: "G2G", text: "Real Life all concept sums" },
    { grade: "G3", code: "G3G", text: "Real Life all concept sums" },
    { grade: "G4", code: "G4G", text: "Real Life all concept sums" },
    { grade: "G1", code: "G1Z", text: "Others" },
    { grade: "G2", code: "G2Z", text: "Others" },
    { grade: "G3", code: "G3Z", text: "Others" },
    { grade: "G4", code: "G4Z", text: "Others" },
  ],
  subtopics: {},
};

const convertTopicToText = (questionData, mathData) => {
  const { grade, topic, topicList } = questionData;

  const result = { ...questionData };

  if (topic) {
    const topicEntry = mathData.topics.find(
      (t) => t.grade === grade && t.code === topic
    );
    if (topicEntry) {
      result.topicText = topicEntry.text;
    } else {
      result.topicText = topic;
    }
  }

  if (topic && topicList && mathData.subtopics[topic]?.[grade]) {
    const subtopicEntry = mathData.subtopics[topic][grade].find(
      (st) => st.code === topicList
    );
    if (subtopicEntry) {
      result.topicListText = subtopicEntry.text;
    } else {
      result.topicListText = topicList;
    }
  }

  return result;
};

const mapTopicToCategory = (topicText) => {
  const normalizedTopic = topicText
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/s$/, '');

  const topicToCategoryMap = {
    'number system': 'Number System',
    'operations (addition, subtraction ....)': 'Operations',
    'operation': 'Operations',
    'shapes and geometry': 'Shapes and Geometry',
    'shape and geometry': 'Shapes and Geometry',
    'measurement': 'Measurement',
    'data handling': 'Data Handling',
    'maths puzzle': 'Maths Puzzles',
    'math puzzle': 'Maths Puzzles',
    'real life all concept sum': 'Real Life all concept sums',
    'other': 'Others',
  };

  for (const [key, category] of Object.entries(topicToCategoryMap)) {
    if (normalizedTopic.includes(key)) {
      return category;
    }
  }

  return 'Others';
};

const Progress = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({
    userId: null,
    authStatus: null,
    dataPath: null,
  });
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [questionDetails, setQuestionDetails] = useState({});
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [questionDetailsLoading, setQuestionDetailsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = firebaseServices.auth.currentUser;
        setDebugInfo((prev) => ({
          ...prev,
          userId: user ? user.uid : 'Not authenticated',
          authStatus: user ? 'Authenticated' : 'Not authenticated',
        }));

        if (!user) {
          setError('User not authenticated. Please sign in.');
          setLoading(false);
          return;
        }

        const userPath = `users/${user.uid}`;
        setDebugInfo((prev) => ({ ...prev, dataPath: userPath }));

        const userRef = firebaseServices.ref(firebaseServices.db, userPath);
        const snapshot = await firebaseServices.get(userRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log('User data found:', data);
          setUserData(data);
        } else {
          console.log('No data available at path:', userPath);
          setError('No user data found. You may need to complete some quizzes first.');
        }
        setLoading(false);
      } catch (err) {
        console.error('Firebase error:', err);
        setError('Error: ' + err.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchAllQuestionDetails = async () => {
      if (!userData?.quizResults) {
        console.log('No quiz results to fetch question details for');
        setQuestionDetails({});
        setQuestionDetailsLoading(false);
        return;
      }

      setQuestionDetailsLoading(true);

      const cachedQuestions = localStorage.getItem('questionDetails');
      const newQuestionDetails = cachedQuestions ? JSON.parse(cachedQuestions) : {};

      try {
        const allQuestionIds = new Set();
        Object.values(userData.quizResults).forEach((quiz) => {
          if (quiz.responses) {
            quiz.responses.forEach((response) => {
              allQuestionIds.add(response.questionId);
            });
          }
        });

        console.log('Total unique question IDs to fetch:', allQuestionIds.size);

        const questionIdsToFetch = Array.from(allQuestionIds).filter(
          (questionId) => !newQuestionDetails[questionId]
        );

        if (questionIdsToFetch.length > 0) {
          console.log('Fetching uncached question IDs:', questionIdsToFetch);

          const questionsRef = firebaseServices.ref(firebaseServices.db, 'questions');
          const snapshot = await firebaseServices.get(questionsRef);

          if (snapshot.exists()) {
            const allQuestions = snapshot.val();
            console.log('Fetched all questions:', allQuestions);

            for (const questionId of questionIdsToFetch) {
              if (allQuestions[questionId]) {
                newQuestionDetails[questionId] = allQuestions[questionId];
              } else {
                newQuestionDetails[questionId] = { question: 'Question not found' };
                console.log(`Question ${questionId} not found in /questions`);
              }
            }
          } else {
            console.log('No questions found at /questions');
            for (const questionId of questionIdsToFetch) {
              newQuestionDetails[questionId] = { question: 'Question not found' };
            }
          }

          localStorage.setItem('questionDetails', JSON.stringify(newQuestionDetails));
        } else {
          console.log('All questions already in cache');
        }

        setQuestionDetails(newQuestionDetails);
      } catch (err) {
        console.error('Error fetching all question details:', err);
        setQuestionDetails((prev) => ({
          ...prev,
          error: 'Error fetching questions',
        }));
      } finally {
        setQuestionDetailsLoading(false);
      }
    };

    fetchAllQuestionDetails();
  }, [userData]);

  const calculateOverallProgress = () => {
    if (!userData || !userData.quizResults) return { attempted: 0, correct: 0, percentage: 0 };

    let totalAttempted = 0;
    let totalCorrect = 0;

    Object.values(userData.quizResults).forEach((quiz) => {
      if (quiz.totalQuestions) totalAttempted += parseInt(quiz.totalQuestions);
      if (quiz.correctAnswers) totalCorrect += parseInt(quiz.correctAnswers);
    });

    return {
      attempted: totalAttempted,
      correct: totalCorrect,
      percentage: totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0,
    };
  };

  const calculateTotalStars = () => {
    if (!userData || !userData.quizResults) return 0;

    const successfulSets = Object.values(userData.quizResults).filter((quiz) => {
      const total = parseInt(quiz.totalQuestions) || 0;
      const correct = parseInt(quiz.correctAnswers) || 0;
      return total > 0 && (correct / total) * 100 >= 50;
    }).length;

    return successfulSets;
  };

  const calculateCategoryProgress = (userData, questionDetails, mathData) => {
    const categories = {
      'Number System': { attempted: 0, correct: 0 },
      'Operations': { attempted: 0, correct: 0 },
      'Shapes and Geometry': { attempted: 0, correct: 0 },
      'Measurement': { attempted: 0, correct: 0 },
      'Data Handling': { attempted: 0, correct: 0 },
      'Maths Puzzles': { attempted: 0, correct: 0 },
      'Real Life all concept sums': { attempted: 0, correct: 0 },
      'Others': { attempted: 0, correct: 0 },
    };

    if (!userData || !userData.quizResults) {
      console.log('No userData or quizResults available');
      return categories;
    }

    Object.values(userData.quizResults).forEach((quiz, quizIndex) => {
      if (!quiz.responses) {
        console.log(`Quiz ${quizIndex} has no responses`);
        return;
      }

      quiz.responses.forEach((response, responseIndex) => {
        const questionId = response.questionId;
        const questionData = questionDetails[questionId];

        if (!questionData) {
          console.log(`Question data not found for questionId: ${questionId}`);
          return;
        }

        if (!questionData.topic || !questionData.grade) {
          console.log(`Question ${questionId} missing topic or grade:`, questionData);
          categories['Others'].attempted += 1;
          if (response.isCorrect) categories['Others'].correct += 1;
          return;
        }

        const convertedQuestion = convertTopicToText(questionData, mathData);
        const topicText = convertedQuestion.topicText;

        console.log(`Question ${questionId} topic: ${topicText}`);

        const category = mapTopicToCategory(topicText);

        console.log(`Mapped topic "${topicText}" to category: ${category}`);

        if (categories[category]) {
          categories[category].attempted += 1;
          if (response.isCorrect) {
            categories[category].correct += 1;
          }
        } else {
          console.log(`Category "${category}" not found, defaulting to Others`);
          categories['Others'].attempted += 1;
          if (response.isCorrect) {
            categories['Others'].correct += 1;
          }
        }
      });
    });

    Object.keys(categories).forEach((category) => {
      const { attempted, correct } = categories[category];
      categories[category].percentage = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
      console.log(`Category ${category}: ${correct}/${attempted} (${categories[category].percentage}%)`);
    });

    return categories;
  };

  const hasStar = (quiz) => {
    const total = parseInt(quiz.totalQuestions) || 0;
    const correct = parseInt(quiz.correctAnswers) || 0;
    return total > 0 && (correct / total) * 100 >= 50;
  };

  const calculateDailyStars = () => {
    if (!userData || !userData.quizResults) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const quizzesToday = Object.values(userData.quizResults).filter((quiz) => {
      const quizDate = new Date(quiz.completedAt);
      quizDate.setHours(0, 0, 0, 0); // Normalize to start of day
      return quizDate.getTime() === today.getTime();
    });

    const successfulSets = quizzesToday.filter((quiz) => {
      const total = parseInt(quiz.totalQuestions) || 0;
      const correct = parseInt(quiz.correctAnswers) || 0;
      return total > 0 && (correct / total) * 100 >= 50;
    }).length;

    return successfulSets; // Number of stars corresponds to number of successful sets
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sortedQuizResults = userData?.quizResults
    ? Object.entries(userData.quizResults).sort(([, quizA], [, quizB]) => {
        return new Date(quizB.completedAt) - new Date(quizA.completedAt);
      })
    : [];

  if (loading) return <div className="loading-message">Loading user progress...</div>;

  if (error) {
    return (
      <div className="progress-container">
        <div className="error-box">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
        <div className="debug-box">
          <h3>Debugging Information</h3>
          <ul>
            <li>User ID: {debugInfo.userId}</li>
            <li>Authentication Status: {debugInfo.authStatus}</li>
            <li>Data Path: {debugInfo.dataPath}</li>
          </ul>
          <div className="solutions">
            <p>Possible solutions:</p>
            <ol>
              <li>Make sure you're signed in.</li>
              <li>Check that you've completed at least one quiz.</li>
              <li>Verify your database rules allow reading from this path.</li>
              <li>Check that the data structure matches what's expected.</li>
            </ol>
          </div>
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  if (!userData || !userData.quizResults || Object.keys(userData.quizResults).length === 0) {
    return (
      <div className="progress-container">
        <h1>Your Learning Progress</h1>
        <div className="empty-state">
          <h2>No Quiz Data Found</h2>
          <p>It looks like you haven't completed any quizzes yet.</p>
          <p>Complete your first quiz to see your progress statistics here!</p>
          <button onClick={() => (window.location.href = '/quizzes')} className="cta-button">
            Go to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const overallProgress = calculateOverallProgress();
  const categoryProgress = calculateCategoryProgress(userData, questionDetails, MATH_DATA);
  const dailyStars = calculateDailyStars();
  const totalStars = calculateTotalStars();

  return (
    <div className="progress-container">
      <h1>Your Learning Progress</h1>

      {/* Overall Progress */}
      <div className="progress-section">
        <h2>Overall Progress</h2>
        <div className="stat-card">
          <div className="metrics-grid">
            <div className="metric-item">
              <p className="metric-label">Total Attempted</p>
              <p className="metric-value">{overallProgress.attempted}</p>
            </div>
            <div className="metric-item">
              <p className="metric-label">Correctly Answered</p>
              <p className="metric-value">{overallProgress.correct}</p>
            </div>
            <div className="metric-item">
              <p className="metric-label">Success Rate</p>
              <p className="metric-value">{overallProgress.percentage}%</p>
            </div>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${overallProgress.percentage}%` }}
            ></div>
          </div>
          <div className="progress-info">
            {overallProgress.correct} of {overallProgress.attempted} questions
          </div>
          <div className="total-stars">
  <h3>Total Stars Earned ({totalStars})</h3>
  {totalStars > 0 ? (
    <div className="stars-container">
      {Array.from({ length: totalStars }, (_, i) => (
        <span key={i} role="img" aria-label="star" className="star-item">
          ⭐
        </span>
      ))}
    </div>
  ) : (
    <p>No stars earned yet. Complete a set above 50% to earn a star!</p>
  )}
</div>

{/* Replace the existing Daily Stars section with this */}
<div className="daily-stars">
  <h3>Today's Achievements</h3>
  {dailyStars > 0 ? (
    <>
      <div className="stars-container">
        {Array.from({ length: dailyStars }, (_, i) => (
          <span key={i} role="img" aria-label="star" className="star-item">
            ⭐
          </span>
        ))}
      </div>
      <p>{`(${dailyStars}x sets completed above 50% today)`}</p>
    </>
  ) : (
    <p>No stars earned yet today. Complete a set above 50% to earn a star!</p>
  )}
</div>
        </div>
      </div>

      {/* Category Progress */}
      <div className="progress-section">
        <h2>Progress by Category</h2>
        {questionDetailsLoading ? (
          <div className="loading-message">Loading category progress...</div>
        ) : (
          <div className="stat-card">
            {Object.entries(categoryProgress).map(([category, data], index) => (
              <div key={category} className="category-progress">
                <div className="progress-header">
                  <span className="progress-label">{category}</span>
                  <span className="progress-percentage">{data.percentage}%</span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className={`progress-bar-fill category-${index}`}
                    style={{ width: `${data.percentage}%` }}
                  ></div>
                </div>
                <div className="progress-info">
                  {data.correct} of {data.attempted} questions
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Quiz Results */}
      <div className="progress-section">
        <h2>Recent Quiz Results</h2>
        <div className="table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>Completed</th>
                <th>Score</th>
                <th>Correct</th>
                <th>Total</th>
                <th>Achievement</th>
              </tr>
            </thead>
            <tbody>
              {sortedQuizResults.map(([quizId, quiz]) => (
                <React.Fragment key={quizId}>
                  <tr
                    onClick={() => setSelectedQuizId(selectedQuizId === quizId ? null : quizId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{formatDate(quiz.completedAt)}</td>
                    <td>{quiz.score || '0'}</td>
                    <td>{quiz.correctAnswers || 0}</td>
                    <td>{quiz.totalQuestions || 0}</td>
                    <td>
                      {hasStar(quiz) ? (
                        <span role="img" aria-label="star">
                          ⭐
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                  {selectedQuizId === quizId && quiz.responses && (
                    <tr>
                      <td colSpan="5">
                        <div className="quiz-details">
                          <h3>Quiz Details</h3>
                          <table className="details-table">
                            <thead>
                              <tr>
                                <th className="question-column">Question</th>
                                <th>Your Answer</th>
                                <th>Correct Answer</th>
                                <th>Result</th>
                              </tr>
                            </thead>
                            <tbody>
                              {quiz.responses.map((response, index) => {
                                const questionData = questionDetails[response.questionId] || {};
                                return (
                                  <React.Fragment key={index}>
                                    <tr
                                      onClick={() =>
                                        setSelectedQuestionId(
                                          selectedQuestionId === response.questionId
                                            ? null
                                            : response.questionId
                                        )
                                      }
                                      style={{ cursor: 'pointer' }}
                                    >
                                      <td className="question-column">
                                        {questionData.question ? (
                                          <div
                                            className="question-content"
                                            dangerouslySetInnerHTML={{
                                              __html: questionData.question,
                                            }}
                                          />
                                        ) : (
                                          'Loading...'
                                        )}
                                      </td>
                                      <td>{response.userAnswer}</td>
                                      <td>{response.correctAnswer.text}</td>
                                      <td
                                        style={{
                                          color: response.isCorrect ? 'green' : 'red',
                                        }}
                                      >
                                        {response.isCorrect ? 'Correct' : 'Incorrect'}
                                      </td>
                                    </tr>
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Progress;