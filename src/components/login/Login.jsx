import React, { useState, useEffect } from 'react';
import './Login.css';
import PracticeTime from '../../assets/PracticeTime.jpg';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { app } from '../../firebase/firebaseSetup';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';



const Login = () => {
    const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Logged in as:", user.displayName);
      // You can save user data to your database here
    } catch (error) {
      console.error("Error during Google login", error);
    }}
    
    return (
        <div className='loginContainer'>
            <img src={PracticeTime} alt="Practice Time" />
            <hr />
            
            <button onClick={handleGoogleLogin} id='signInWithGoogle'>Sign in with Google</button>

            {/* Recaptcha container */}
            <div id="recaptcha"></div>
        </div>
    );
};

export default Login;
