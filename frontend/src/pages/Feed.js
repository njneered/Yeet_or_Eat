import React, { useEffect } from "react";
import Header from '../components/Header';


export default function Feed() {
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/ping`)
      .then((res) => res.json())
      .then((data) => console.log("Backend says:", data.message))
      .catch((err) => console.error(" Ping failed:", err));
  }, []);

  return (
    <>
      <Header />
      <h2>Welcome to your feed!</h2>
    </>
  );
}
