import React from 'react'
import Quiz from './components/quiz/Quiz'
import Login from './components/login/Login'
import { BrowserRouter as Router, Routes, Route, createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './components/home/Home';

const App = () => {
  const router = createBrowserRouter([
    { path : "/" ,
      element :<Login /> },
    {path : "/home",
       element : <Home />}
  ])
  
  return (
    <>
      
      <RouterProvider router={router}/>
       
    </>
  )
}

export default App