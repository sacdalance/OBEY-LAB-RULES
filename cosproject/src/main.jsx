import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import App from './App.jsx';
import Login from './Login';
import Dashboard from './Dashboard';
import Modify from './Modify'; 

import './index.css';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn')
  return isLoggedIn ? children : <Navigate to="/" replace />;
};

// Define routes
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // App component serves as the layout
    children: [
      { path: "/", element: <Login /> }, // Login page
      { path: "dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute>  }, // Dashboard page
      { path: "modify/:id", element: <ProtectedRoute><Modify /></ProtectedRoute> }, // Modify page
    ],
  },
]);

// Render the RouterProvider
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
