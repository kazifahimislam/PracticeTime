import React from 'react'
import PracticeTime from '../../assets/practiceTime.jpg'
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Home = () => {
    const navigate = useNavigate(); // Initialize useNavigate
    const navigateToQuiz = () => {navigate('/quiz')}
  return (

    // <div><h1>The more you practice, the better you become</h1>
    <div className='quizContainer'>
           <img src={PracticeTime} alt="" />
            <hr />
            
            <button onClick={navigateToQuiz}>Start Quiz</button>
            
                
            </div>
        
       
  )
}

export default Home