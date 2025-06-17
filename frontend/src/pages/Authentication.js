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
        // Get values from inputs
        const email = event.target[0].value;
        const password = event.target[1].value;
        const username = isLoginMode ? null : event.target[2].value;
        alert(isLoginMode ? "Logging in..." : "Signing up...");

        // NEED TO CONNECT TO BACKEND LATER
        const endpoint = isLoginMode ? '/login' : '/signup';
        const url = `http://localhost:5050${endpoint}`;
        console.log("Sending request to:", url);
        console.log("Payload:", { email, password, ...(username && { username }) });
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                ...(username && { username }) // only include username if signing up
            }),
        })
        .then(async (res) => {
            const data = await res.json();
            alert(data.message);
            if (res.status === 200) {
                // Redirect to feed / profile maybe?
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Something went wrong dawg. Please try again.');
        })
        

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