import React from 'react'
import Quiz from './components/quiz/Quiz'
import Login from './components/login/Login'
import { BrowserRouter as Router, Routes, Route, createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './components/home/Home';
import ProtectedRoute from './route/ProtectedRoute';

const App = () => {
  const router = createBrowserRouter([
    { path : "/" ,
      element :<Login /> },
    {path : "/home",
       element : <ProtectedRoute><Home /></ProtectedRoute>},
       {path : "/quiz",
        element : <ProtectedRoute><Quiz /></ProtectedRoute>}
  ])
  
  return (
    <>
      
      <RouterProvider router={router}/>
       
    </>
  )
}

export default App