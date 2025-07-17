import React, { useEffect } from "react";

export default function Feed() {
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/ping`)
      .then((res) => res.json())
      .then((data) => console.log("Backend says:", data.message))
      .catch((err) => console.error(" Ping failed:", err));
  }, []);

  return <h2>User Feed</h2>;
}
