import React, { useState, useEffect } from 'react';
import PracticeTime from '../../assets/practiceTime.jpg';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import firebaseServices from '../firebase/firebaseSetup';
import './Home.css';

const Home = () => {
  const { auth, provider, db, ref, set, get, child } = firebaseServices;
  const navigate = useNavigate();
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dailyQuizSet, setDailyQuizSet] = useState('');
  const [hasQuizzes, setHasQuizzes] = useState(false);

  useEffect(() => {
    const fetchAssignedQuizzes = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (user) {
          const userId = user.uid;
          const userRef = ref(db, `users/${userId}/assignedSets`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const assignedSetsData = snapshot.val();
            // If assignedSets is an object, convert to array
            const quizzes = typeof assignedSetsData === 'object' ?
              Object.keys(assignedSetsData) :
              Array.isArray(assignedSetsData) ? assignedSetsData : [];
            
            setAssignedQuizzes(quizzes);
            
            if (quizzes.length > 0) {
              setHasQuizzes(true);
              // Get daily quiz set based on the date
              const dailySet = getDailyQuizSet(quizzes);
              setDailyQuizSet(dailySet);
            } else {
              setHasQuizzes(false);
            }
          } else {
            setAssignedQuizzes([]);
            setHasQuizzes(false);
          }
        }
      } catch (error) {
        console.error("Error fetching assigned quizzes:", error);
        setHasQuizzes(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedQuizzes();
  }, []);

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
    navigate('/quiz', { state: { selectedQuizSet: dailyQuizSet } });
  };

  return (
    <div className='homeContainer'>
      <h1>The more you practice, the better you become</h1>
      <div className='quizHomeContainer'>
        
        <hr />
        
        {loading ? (
          <p>Loading your daily practice...</p>
        ) : (
          <div className='assignedQuizInfo'>
            {hasQuizzes ? (
              <>
                <h2>Your daily practice is ready!</h2>
                
                <button 
                  onClick={navigateToQuiz}
                  disabled={!dailyQuizSet}
                  className="startQuizButton"
                >
                  Start today's practice
                </button>
              </>
            ) : (
              <div>
                <p>You don't have any practice assigned yet.</p>
                <button disabled>Start practice</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;