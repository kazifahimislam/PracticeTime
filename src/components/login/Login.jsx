import React, { useEffect } from "react";
import "./Login.css";
import PracticeTime from "../../assets/practiceTime.jpg";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import firebaseServices from "../../firebase/firebaseSetup"; // Import Firebase services

const Login = () => {
    const { auth, provider, db, ref, set, get, child } = firebaseServices; // Destructure Firebase services
    const navigate = useNavigate();

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
        }
    };

    return (
        <div className="loginContainer">
            <img src={PracticeTime} alt="Practice Time" />
            <hr />
            <button onClick={handleGoogleLogin} id="signInWithGoogle">
                Sign in with Google
            </button>
        </div>
    );
};

export default Login;
