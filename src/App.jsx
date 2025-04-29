import React, { useState, useEffect } from 'react';
import Quiz from './components/quiz/Quiz';
import Login from './components/login/Login';
import Home from './components/home/Home';
import Navbar from './components/navbar/Navbar';
import Progress from './components/progress/Progress';
import Start from './components/start/start';

const App = () => {
  // Check authentication status
  const isAuthenticated = () => {
    const storedUser = localStorage.getItem("user");
    return storedUser !== null;
  };

  // State to track current page
  const [currentPage, setCurrentPage] = useState("login");
  
  // Check authentication on initial load
  useEffect(() => {
    if (isAuthenticated()) {
      setCurrentPage("home");
    } else {
      setCurrentPage("login");
    }
  }, []);

  // Function to handle navigation
  const navigate = (page) => {
    // Check if authentication is required
    if (page !== 'login' && !isAuthenticated()) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage(page);
  };

  // Make navigation function globally available
  useEffect(() => {
    window.appNavigate = navigate;
    return () => {
      delete window.appNavigate;
    };
  }, []);

  // Render appropriate component based on currentPage
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home />;
      case "practice":
        return <Quiz />;
        case "start":
          return <Start />;   // Start.jsx page
  
      case "progress":
        return <Progress />;
      case "login":
      default:
        return <Login onLoginSuccess={() => navigate('start')} />;
    }
  };
  
  return (
    <>
      {isAuthenticated() && <Navbar onNavigate={navigate} />}
      {renderPage()}
    </>
  );
};

export default App;