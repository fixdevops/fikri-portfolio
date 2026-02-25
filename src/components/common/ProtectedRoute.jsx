import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../../firebase";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((nextUser) => {
      setUser(nextUser || null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
