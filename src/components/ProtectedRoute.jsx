import React from 'react';
import { useAdmin } from '../context/AdminContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdmin();

  if (loading) {
    return <div className="text-center mt-5">Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    // Optionally, you could use a navigation redirect here if using React Router
    return <div className="text-center mt-5 text-danger">Access denied. Please login as admin.</div>;
  }

  return children;
};

export default ProtectedRoute; 