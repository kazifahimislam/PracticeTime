import React, { useState, useEffect } from 'react';
import firebaseServices from '../firebase/firebaseSetup';
import './Progress.css';

const Progress = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({
    userId: null,
    authStatus: null,
    dataPath: null,
  });
  const [selectedQuizId, setSelectedQuizId] = useState(null); // Track which quiz details to show
  const [questionDetails, setQuestionDetails] = useState({}); // Store fetched question details
  const [selectedQuestionId, setSelectedQuestionId] = useState(null); // Track which question's details to show

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

  // Fetch question details when a quiz is selected
  useEffect(() => {
    const fetchQuestionDetails = async () => {
      if (!selectedQuizId || !userData?.quizResults?.[selectedQuizId]?.responses) {
        setQuestionDetails({});
        return;
      }

      const responses = userData.quizResults[selectedQuizId].responses;
      const newQuestionDetails = {};

      try {
        for (const response of responses) {
          const questionId = response.questionId;
          const questionPath = `questions/${questionId}`;
          const questionRef = firebaseServices.ref(firebaseServices.db, questionPath);
          const snapshot = await firebaseServices.get(questionRef);

          if (snapshot.exists()) {
            newQuestionDetails[questionId] = snapshot.val();
          } else {
            newQuestionDetails[questionId] = { question: 'Question not found' };
          }
        }
        setQuestionDetails(newQuestionDetails);
      } catch (err) {
        console.error('Error fetching question details:', err);
        setQuestionDetails((prev) => ({
          ...prev,
          [responses[0]?.questionId]: { question: 'Error fetching question' },
        }));
      }
    };

    fetchQuestionDetails();
  }, [selectedQuizId, userData]);

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

  const calculateCategoryProgress = () => {
    const categories = {
      'Number System': { attempted: 0, correct: 0 },
      Operations: { attempted: 0, correct: 0 },
      'Shape and Geometry': { attempted: 0, correct: 0 },
      Measurement: { attempted: 0, correct: 0 },
      'Data Handling': { attempted: 0, correct: 0 },
      Puzzles: { attempted: 0, correct: 0 },
    };

    if (!userData || !userData.quizResults) return categories;

    Object.values(userData.quizResults).forEach((quiz) => {
      const setId = quiz.selectedSet || '';
      let category = 'Operations';

      if (setId.includes('Number')) {
        category = 'Number System';
      } else if (setId.includes('Shape') || setId.includes('Geo')) {
        category = 'Shape and Geometry';
      } else if (setId.includes('Measure')) {
        category = 'Measurement';
      } else if (setId.includes('Data')) {
        category = 'Data Handling';
      } else if (setId.includes('Puzzle')) {
        category = 'Puzzles';
      }

      if (quiz.totalQuestions) categories[category].attempted += parseInt(quiz.totalQuestions);
      if (quiz.correctAnswers) categories[category].correct += parseInt(quiz.correctAnswers);
    });

    Object.keys(categories).forEach((category) => {
      const { attempted, correct } = categories[category];
      categories[category].percentage = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    });

    return categories;
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
  const categoryProgress = calculateCategoryProgress();

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
        </div>
      </div>

      {/* Category Progress */}
      <div className="progress-section">
        <h2>Progress by Category</h2>
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
                  </tr>
                  {/* Show details if this quiz is selected */}
                  {selectedQuizId === quizId && quiz.responses && (
                    <tr>
                      <td colSpan="4">
                        <div className="quiz-details">
                          <h3>Quiz Details</h3>
                          <table className="details-table">
                            <thead>
                              <tr>
                                <th>Question</th>
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
                                      <td>
                                        {questionData.question ? (
                                          <div
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
                                    {/* Show additional question details if this question is selected */}
                                    {selectedQuestionId === response.questionId && questionData && (
                                      <tr>
                                        <td colSpan="4">
                                          <div className="question-details">
                                            <h4>Question Details</h4>
                                            <p>
                                              <strong>Difficulty Level:</strong>{' '}
                                              {questionData.difficultyLevel || 'N/A'}
                                            </p>
                                            <p>
                                              <strong>Grade:</strong> {questionData.grade || 'N/A'}
                                            </p>
                                            <p>
                                              <strong>Topic:</strong> {questionData.topic || 'N/A'}
                                            </p>
                                            {questionData.options && (
                                              <p>
                                                <strong>Options:</strong>{' '}
                                                {Object.values(questionData.options).join(', ')}
                                              </p>
                                            )}
                                            <p>
                                              <strong>Date Added:</strong>{' '}
                                              {questionData.date
                                                ? formatDate(questionData.date)
                                                : 'N/A'}
                                            </p>
                                            <p>
                                              <strong>Topic List:</strong>{' '}
                                              {questionData.topicList || 'N/A'}
                                            </p>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
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