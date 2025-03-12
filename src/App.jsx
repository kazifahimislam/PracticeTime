import React from 'react'
import Quiz from './components/quiz/Quiz'
import Login from './components/login/Login'
import { BrowserRouter as Router, Routes, Route, createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './components/home/Home';
import ProtectedRoute from './route/ProtectedRoute';
import Navbar from '../src/components/navbar/Navbar';

const App = () => {
  const router = createBrowserRouter([
    { path : "/" ,
      element :<Login /> },
    {path : "/start",
       element : <><Navbar/><ProtectedRoute><Home /></ProtectedRoute></>},
       {path : "/practice",
        element : <><Navbar/><ProtectedRoute><Quiz /></ProtectedRoute></>}
  ])
  
  return (
    <>
      
      <RouterProvider router={router}/>
       
    </>
  )
}

export default App