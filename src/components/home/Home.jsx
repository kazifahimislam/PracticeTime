import React, { useState, useEffect } from 'react';
import PracticeTime from '../../assets/practiceTime.jpg';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import firebaseServices from '../firebase/firebaseSetup'; // Ensure you have this import for your Firebase db

const Home = () => {
  const { auth, provider, db, ref, set, get, child } = firebaseServices;
  const navigate = useNavigate();
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

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
          } else {
            setAssignedQuizzes([]);
          }
        }
      } catch (error) {
        console.error("Error fetching assigned quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedQuizzes();
  }, []);

  const navigateToQuiz = () => {
    navigate('/quiz');
  };

  return (
    <div className='homeContainer'>
      <h1>The more you practice, the better you become</h1>
      <div className='quizContainer'>
        <img src={PracticeTime} alt="Practice time illustration" />
        <hr />
        
        {loading ? (
          <p>Loading your quizzes...</p>
        ) : (
          <div className='assignedQuizInfo'>
            {assignedQuizzes.length > 0 ? (
              <>
                <h2>You have {assignedQuizzes.length} quiz set(s) assigned:</h2>
                <ul>
                  {assignedQuizzes.map((quiz, index) => (
                    <li key={index}>{quiz}</li>
                  ))}
                </ul>
                <button onClick={navigateToQuiz}>Start Quiz</button>
              </>
            ) : (
              <div>
                <p>You don't have any quizzes assigned yet.</p>
                <button disabled>Start Quiz</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;