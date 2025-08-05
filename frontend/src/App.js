import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Authentication from './pages/Authentication';
import SubmitReview from './pages/SubmitReview';
import MyReviews from './pages/MyReviews';
import EditReview from './pages/EditReview';
import AdminPanel from './pages/AdminPanel'
import WannaEat from './pages/WannaEat';
import GonnaEat from './pages/GonnaEat';
import AlreadyAte from './pages/AlreadyAte';
import ViewReview from './pages/ViewReview';
import EditProfile from "./pages/EditProfile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Authentication/>} />
        <Route path="/profile" element={<Profile />} />
        <Route path = "/feed" element={<Feed/>} />
        <Route path="/submit" element={<SubmitReview />} />
        <Route path="/my-reviews" element={<MyReviews />} />
        <Route path="/edit/:id" element={<EditReview />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/wanna-eat" element={<WannaEat />}/>
        <Route path="/gonna-eat" element={<GonnaEat />}/>
        <Route path="/already-ate" element={<AlreadyAte />} />
        <Route path="/view-review/:id" element={<ViewReview />} />
        <Route path="/edit-profile" element={<EditProfile />} />

        
      </Routes>
    </Router>
  );
}

export default App;
