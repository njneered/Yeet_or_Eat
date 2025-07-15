import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Authentication from './pages/Authentication';
import SubmitReview from './pages/SubmitReview';
import MyReviews from './pages/MyReviews';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Authentication/>} />
        <Route path="/profile" element={<Profile />} />
        <Route path = "/feed" element={<Feed/>} />
        <Route path="/submit" element={<SubmitReview />} />
        <Route path="/my-reviews" element={<MyReviews />} />
        
      </Routes>
    </Router>
  );
}

export default App;
