import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminContext = createContext();

const API_BASE = import.meta.env.VITE_API_BASE_URL ;

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      // Check localStorage first
      const storedAdmin = localStorage.getItem('adminUser');
      if (storedAdmin) {
        const adminData = JSON.parse(storedAdmin);
        
        // Verify with server
        const response = await axios.get(API_BASE + '/auth/check-auth', {
          withCredentials: true
        });

        if (response.data && response.data.user) {
          if (response.data.user.is_admin && response.data.user.role === 'admin') {
            setAdminUser(response.data.user);
          } else {
            localStorage.removeItem('adminUser');
          }
        }
      }
    } catch (error) {
      console.error('Admin auth check failed:', error);
      localStorage.removeItem('adminUser');
    } finally {
      setLoading(false);
    }
  };

  const loginAdmin = (userData) => {
    setAdminUser(userData);
    localStorage.setItem('adminUser', JSON.stringify(userData));
  };

  const logoutAdmin = async () => {
    try {
      await axios.post(API_BASE + '/auth/logout', {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAdminUser(null);
      localStorage.removeItem('adminUser');
    }
  };

  const value = {
    adminUser,
    loading,
    loginAdmin,
    logoutAdmin,
    isAuthenticated: !!adminUser
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
