import React, {useState} from 'react';
import Header from '../components/Header';
import supabase from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import './Authentication.css';

const typingSound = new Audio('/vine-boom.mp3');
typingSound.volume = 0.5;

function Authentication(){
  const navigate = useNavigate();
    // keeps track of whether the user is logging in/signing up
    const [isLoginMode, setIsLoginMode] = useState(true);

    // switch between login and sign up form
    function handleToggle(){
        setIsLoginMode(!isLoginMode);
    }

    // runs when form is submitted

async function handleSubmit(event) {
  event.preventDefault();
  const email = event.target[0].value;
  const password = event.target[1].value;
  const username = isLoginMode ? null : event.target[2].value;

  if (isLoginMode) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert('Login failed: ' + error.message);
    alert('Login successful!');
    console.log('User:', data.user);
    navigate('/feed'); // takes user to feed page immediately after logging in
  } else {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return alert('Signup failed: ' + error.message);
    alert('Signup successful!');
    console.log('Signed up user:', data.user);

    // Optionally insert into 'profiles' table here
    if (username) {
      await supabase.from('profiles').insert([
        { id: data.user.id, username, email }
      ]);
    }
    
    navigate('/feed'); // takes user to feed page immediately after signing up
  }
}


    return (
    <>
        <div className="page-container">
            <Header />
            {/* MAIN BODY WITH WHITE LOGO AND AUTHENTICATION BOX */}
            <main className = "auth-layout">
                    <div className ="auth-graphic">
                        <img
                            src="/logo-white.png"
                            alt="Yeet or Eat White Logo"
                            className="auth-logo-white"
                        />
                    </div>      
                    <div className = "auth-box"> 
                        <h2>{isLoginMode ? "LET ME IIIIIIIN 😩" : "new phone who dis?"}</h2>
                        <form onSubmit={handleSubmit}>
                            <input type="email" placeholder="Email" required onInput={() => {
                                                                                              typingSound.currentTime = 0;
                                                                                              typingSound.play();
                                                                                            }}/>
                            <input type="password" placeholder="Password" required onInput={() => {
                                                                                              typingSound.currentTime = 0;
                                                                                              typingSound.play();
                                                                                            }}/>
                            {!isLoginMode && <input type="username" placeholder="Username" required onInput={() => {
                                                                                              typingSound.currentTime = 0;
                                                                                              typingSound.play();
                                                                                            }}/>}
                            <button type="submit" onClick={() => typingSound.play()}>{isLoginMode ? "Login" : "Create Account"}</button>
                        </form>
                        <p onClick={handleToggle} className="toggle-text">
                            {isLoginMode
                            ? "Need an account? Click here to Sign Up"
                            : "Already have an account? Click here to Login"}
                        
                        </p>
                    </div>    
            </main>            

            <div className="bottom-bar" />
        </div>
    </>

            
    );
}

export default Authentication;