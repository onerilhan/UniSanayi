import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import StudentDashboard from './pages/student/StudentDashboard';
import CompanyDashboard from './pages/company/CompanyDashboard';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/student" element={
          <ProtectedRoute userType="Student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/company" element={
          <ProtectedRoute userType="Company">
            <CompanyDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  );
}