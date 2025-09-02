import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  userType?: 'Student' | 'Company';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, userType }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Loading durumunda spinner göster
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: '#667eea'
      }}>
        <div>Yükleniyor...</div>
      </div>
    );
  }

  // Giriş yapılmamışsa login sayfasına yönlendir
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Belirli bir user type gerekiyorsa kontrol et
  if (userType && user?.userType !== userType) {
    // Yanlış user type ise uygun sayfaya yönlendir
    const redirectTo = user?.userType === 'Student' ? '/student' : '/company';
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;