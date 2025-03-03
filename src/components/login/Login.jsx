import React, { useEffect, useState } from "react";
import "./Login.css";
import PracticeTime from "../../assets/practiceTime.jpg";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import firebaseServices from "../firebase/firebaseSetup";

const Login = () => {
  const { auth, provider, db, ref, set, get, child } = firebaseServices;
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // ✅ Check if user is already logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      navigate("/home");
    }
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        console.log("Logged in as:", user.displayName);

        // ✅ Reference to user data in Realtime Database
        const userRef = ref(db, `users/${user.uid}`);

        // ✅ Check if user already exists before saving new data
        get(child(ref(db), `users/${user.uid}`)).then((snapshot) => {
          if (!snapshot.exists()) {
            set(userRef, {
              name: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              uid: user.uid,
              loginDate: new Date().toISOString(),
            });
          }
        });

        // ✅ Save user login status in localStorage
        localStorage.setItem("user", JSON.stringify({
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          uid: user.uid
        }));

        navigate("/home"); // Redirect to Home
      }
    } catch (error) {
      console.error("Error during Google login", error);
      setError("Failed to sign in with Google. Please try again.");
    }
  };

  const handleUsernamePasswordAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    if (!username || !password) {
      setError("Username and password are required");
      setLoading(false);
      return;
    }
    
    // Convert username to email format by appending @gmail.com
    const email = `${username}@gmail.com`;
    
    try {
      let userCredential;
      
      if (isSignUp) {
        // Create new user account
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Sign in existing user
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      
      const user = userCredential.user;
      
      if (user) {
        // Save user data in Realtime Database if signing up
        if (isSignUp) {
          const userRef = ref(db, `users/${user.uid}`);
          await set(userRef, {
            name: username,
            email: user.email,
            uid: user.uid,
            loginDate: new Date().toISOString(),
          });
        }
        
        // Save user login status in localStorage
        localStorage.setItem("user", JSON.stringify({
          name: username,
          email: user.email,
          uid: user.uid
        }));
        
        navigate("/home");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      
      // Handle specific error codes
      if (error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
        setError("Invalid username or password");
      } else if (error.code === "auth/email-already-in-use") {
        setError("Username already exists. Please try another or sign in.");
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else {
        setError(`Authentication failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginWrapper">
      <div className="loginContainer">
        <img src={PracticeTime} alt="Practice Time" />
        <hr />
        
        {error && <div className="errorMessage">{error}</div>}
        
        <form onSubmit={handleUsernamePasswordAuth} className="loginForm">
          <div className="formGroup">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="formGroup">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="loginButton"
            disabled={loading}
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>
        
        
        
        <div className="divider">
          <span>OR</span>
        </div>
        
        <button onClick={handleGoogleLogin} id="signInWithGoogle" disabled={loading}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;