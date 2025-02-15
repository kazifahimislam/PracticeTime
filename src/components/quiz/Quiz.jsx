import React from 'react'
import './Quiz.css'
import PracticeTime from '../../assets/practiceTime.jpg'

const Quiz = () => {
  return (
    <div className='quizContainer'>
       <img src={PracticeTime} alt="" />
        <hr />
        <h2>If a+b = 10 and a = 6 then b=?</h2>
        <ul>
            <li>3</li>
            <li>6</li>
            <li>1</li>
            <li>4</li>
        </ul>

        <button>Next</button>
        <div className='quizIndex'>
            1 of 5 questions
        </div>
    </div>
  )
}

export default Quiz