import React, {useState} from 'react';

import './Authentication.css';

function Authentication(){
    // keeps track of whether the user is logging in/signing up
    const [isLoginMode, setIsLoginMode] = useState(true);

    // switch between login and sign up form
    function handleToggle(){
        setIsLoginMode(!isLoginMode);
    }

    // runs when form is submitted
    function handleSubmit(event){
        // prevents page from reloading
        event.preventDefault();
        alert(isLoginMode ? "Logging in..." : "Signing up...");
        // NEED TO CONNECT TO BACKEND LATER
    }

    return (
    <>
        <img src="/Yeet-or-Eat-Logo white.png" alt="Yeet or Eat Logo" className="logo" />


        <div className= "auth-container">
            <div className = "auth-box">
                <h2> {isLoginMode ? "LET ME IIIIIIIN 😩" : "new phone who dis?"} </h2>

                <form onSubmit = {handleSubmit}>
                    <input type = "email" placeholder = "Email" required />
                    <input type = "password" placeholder = "Password" required />

                    {/*SHOW THIS EXTRA FIELD ONLY IF SIGNING UP */}
                    {!isLoginMode && (
                        <input type = "text" placeholder = "Username" required />
                    )}

                    <button type = "submit">
                        {isLoginMode ? "Login" : "Create Account"}
                    </button>
                </form>

                <p onClick = {handleToggle} className = "toggle-text">
                    {isLoginMode
                        ? "Need an account? Click here to Sign Up"
                        : "Already have an account? Click here to Login"}
                </p>
            </div>
        </div>    
    </>                
    );
}

export default Authentication;