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
    dataPath: null
  });
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check auth state
        const user = firebaseServices.auth.currentUser;
        
        // Update debug info
        setDebugInfo(prev => ({
          ...prev, 
          userId: user ? user.uid : 'Not authenticated',
          authStatus: user ? 'Authenticated' : 'Not authenticated'
        }));
        
        if (!user) {
          setError("User not authenticated. Please sign in.");
          setLoading(false);
          return;
        }
        
        // Path for user data
        const userPath = `users/${user.uid}`;
        setDebugInfo(prev => ({ ...prev, dataPath: userPath }));
        
        // Reference to user data
        const userRef = firebaseServices.ref(firebaseServices.db, userPath);
        
        // Get data once
        const snapshot = await firebaseServices.get(userRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log("User data found:", data); // Debug log
          setUserData(data);
        } else {
          console.log("No data available at path:", userPath); // Debug log
          setError("No user data found. You may need to complete some quizzes first.");
        }
        setLoading(false);
      } catch (err) {
        console.error("Firebase error:", err); // Debug log
        setError("Error: " + err.message);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!userData || !userData.quizResults) return { attempted: 0, correct: 0, percentage: 0 };
    
    let totalAttempted = 0;
    let totalCorrect = 0;
    
    Object.values(userData.quizResults).forEach(quiz => {
      if (quiz.totalQuestions) totalAttempted += parseInt(quiz.totalQuestions);
      if (quiz.correctAnswers) totalCorrect += parseInt(quiz.correctAnswers);
    });
    
    return {
      attempted: totalAttempted,
      correct: totalCorrect,
      percentage: totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0
    };
  };
  
  // Calculate category progress
  const calculateCategoryProgress = () => {
    const categories = {
      'Number System': { attempted: 0, correct: 0 },
      'Operations': { attempted: 0, correct: 0 },
      'Shape and Geometry': { attempted: 0, correct: 0 },
      'Measurement': { attempted: 0, correct: 0 },
      'Data Handling': { attempted: 0, correct: 0 },
      'Puzzles': { attempted: 0, correct: 0 }
    };
    
    if (!userData || !userData.quizResults) return categories;
    
    // Extract category from quiz set ID
    Object.values(userData.quizResults).forEach(quiz => {
      const setId = quiz.selectedSet || '';
      
      let category = 'Operations'; // Default
      
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
    
    // Calculate percentages
    Object.keys(categories).forEach(category => {
      const { attempted, correct } = categories[category];
      categories[category].percentage = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    });
    
    return categories;
  };
  
  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) return <div className="loading-message">Loading user progress...</div>;
  
  // Show debug information when there's an error
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
          
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }
  
  // Default when there is no error but also no quiz data
  if (!userData || !userData.quizResults || Object.keys(userData.quizResults).length === 0) {
    return (
      <div className="progress-container">
        <h1>Your Learning Progress</h1>
        
        <div className="empty-state">
          <h2>No Quiz Data Found</h2>
          <p>It looks like you haven't completed any quizzes yet.</p>
          <p>Complete your first quiz to see your progress statistics here!</p>
          
          <button 
            onClick={() => window.location.href = '/quizzes'}
            className="cta-button"
          >
            Go to Quizzes
          </button>
        </div>
      </div>
    );
  }
  
  const overallProgress = calculateOverallProgress();
  const categoryProgress = calculateCategoryProgress();
  
  // Main component view
  return (
    <div className="progress-container">
      <h1>Your Learning Progress</h1>
      
      {/* User Info */}
      {userData && (
        <div className="user-info">
          <p><strong>Account Created:</strong> {formatDate(userData.createdAt)}</p>
          <p><strong>Email:</strong> {userData.email.replace(/@gmail\.com$/, "")}</p>
        </div>
      )}
      
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
                <th>Quiz Set</th>
                <th>Completed</th>
                <th>Score</th>
                <th>Correct</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(userData.quizResults).map(([quizId, quiz]) => (
                <tr key={quizId}>
                  <td>{quiz.selectedSet || quizId}</td>
                  <td>{formatDate(quiz.completedAt)}</td>
                  <td>{quiz.score || 'N/A'}</td>
                  <td>{quiz.correctAnswers || 0}</td>
                  <td>{quiz.totalQuestions || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Learning Goals */}
      {/* <div className="goals-section">
        <h3>Learning Goals</h3>
        <p>We expect you to complete 500 questions in each topic category for optimal learning progress.</p>
        <p>Current progress: {overallProgress.attempted} of 3000 total questions ({Math.round((overallProgress.attempted / 3000) * 100)}%)</p>
      </div> */}
    </div>
  );
};

export default Progress;