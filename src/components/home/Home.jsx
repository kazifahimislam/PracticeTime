import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import firebaseServices from '../firebase/firebaseSetup';
import './Home.css';
import practiceTime from '../../assets/practiceTime.jpg';

const Home = ({ onNavigate }) => {
  const { db, ref, get } = firebaseServices;
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyQuizSet, setDailyQuizSet] = useState('');
  const [hasQuizzes, setHasQuizzes] = useState(false);
  const [user, setUser] = useState(null);
  
  // Listen for authentication state changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(true); // Reset loading when auth state changes
    });
    
    // Clean up subscription
    return () => unsubscribe();
  }, []);
  
  // Fetch quizzes whenever user changes
  useEffect(() => {
    const fetchAssignedQuizzes = async () => {
      try {
        if (!user) {
          setLoading(false);
          setHasQuizzes(false);
          return;
        }
        
        const userId = user.uid;
        console.log("Fetching quizzes for user:", userId);
        
        const userRef = ref(db, `users/${userId}/assignedSets`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const assignedSetsData = snapshot.val();
          console.log("Assigned sets data:", assignedSetsData);
          
          let quizzes = [];
          
          // Handle different data structures
          if (typeof assignedSetsData === 'object' && !Array.isArray(assignedSetsData)) {
            quizzes = Object.keys(assignedSetsData);
          } else if (Array.isArray(assignedSetsData)) {
            quizzes = assignedSetsData.filter(item => item); // Filter out null/undefined values
          }
          
          console.log("Processed quizzes:", quizzes);
          
          // Check if there are valid quizzes
          if (quizzes.length > 0) {
            setAssignedQuizzes(quizzes);
            setHasQuizzes(true);
            
            // Get daily quiz set based on the date
            const dailySet = getDailyQuizSet(quizzes);
            setDailyQuizSet(dailySet);
            console.log("Daily quiz set:", dailySet);
          } else {
            setAssignedQuizzes([]);
            setHasQuizzes(false);
          }
        } else {
          console.log("No assigned sets found");
          setAssignedQuizzes([]);
          setHasQuizzes(false);
        }
      } catch (error) {
        console.error("Error fetching assigned quizzes:", error);
        setHasQuizzes(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignedQuizzes();
  }, [user, db]); // Re-run when user or db changes
  
  // Function to determine the daily quiz set based on the date
  const getDailyQuizSet = (quizzes) => {
    if (!quizzes || quizzes.length === 0) return '';
    
    // Use the day of the year to cycle through the quiz sets
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    
    // Use modulo to ensure we get a valid index in the array
    const dailyIndex = dayOfYear % quizzes.length;
    
    return quizzes[dailyIndex];
  };
  
  const navigateToQuiz = () => {
    // Store the selected quiz set in localStorage instead of router state
    localStorage.setItem('selectedQuizSet', dailyQuizSet);
    
    // Use the parent component's navigation function
    if (window.appNavigate) {
      window.appNavigate('practice');
    }
  };
  
  return (
    <div className='homeContainer'>
      <div className='quizHomeContainer'>
        <img 
          src={practiceTime} 
          onClick={() => {
            if (window.appNavigate) {
              window.appNavigate('start');
            }
          }} 
          alt="Practice Time" 
        />
        <h1>The more you practice, the better you become</h1>
        <hr />
        
        {loading ? (
          <div className="loadingIndicator">
            <p>Loading your daily practice...</p>
          </div>
        ) : (
          <div className='assignedQuizInfo'>
            {hasQuizzes ? (
              <>
                <h2>Your daily practice is ready!</h2>
                <button
                  onClick={navigateToQuiz}
                  className="startQuizButton"
                >
                  Start today's practice
                </button>
              </>
            ) : (
              <div className="noQuizzesMessage">
                <p>You don't have any PracticeSheet assigned yet
                .</p>
                <button disabled className="disabledButton">Start PracticeSheet
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;