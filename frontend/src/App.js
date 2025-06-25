import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Authentication from './pages/Authentication';
import SubmitReview from './pages/SubmitReview';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Authentication/>} />
        <Route path="/profile" element={<Profile />} />
        <Route path = "/feed" element={<Feed/>} />
        <Route path="/submit" element={<SubmitReview />} />
        
      </Routes>
    </Router>
  );
}

export default App;
