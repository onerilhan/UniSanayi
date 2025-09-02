import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import UserTypeSelector from './components/UserTypeSelector';
import StudentRegisterForm from './components/StudentRegisterForm';
import CompanyRegisterForm from './components/CompanyRegisterForm';

type UserType = 'Student' | 'Company' | null;

const Register: React.FC = () => {
  const [selectedUserType, setSelectedUserType] = useState<UserType>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Zaten giriş yapılmışsa ana sayfaya yönlendir
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleUserTypeSelect = (type: UserType) => {
    setSelectedUserType(type);
  };

  const handleBackToSelection = () => {
    setSelectedUserType(null);
  };

  const handleRegisterSuccess = (userType: 'Student' | 'Company') => {
    // Registration başarılı olduğunda AuthContext otomatik login yapacak
    // useAuth hook'u dashboard'a yönlendirecek
    const redirectTo = userType === 'Student' ? '/student' : '/company';
    setTimeout(() => {
      navigate(redirectTo, { replace: true });
    }, 1500);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#f8f9fa', 
      padding: '20px' 
    }}>
      {!selectedUserType && (
        <UserTypeSelector onSelect={handleUserTypeSelect} />
      )}
      
      {selectedUserType === 'Student' && (
        <StudentRegisterForm 
          onBack={handleBackToSelection}
          onSuccess={() => handleRegisterSuccess('Student')}
        />
      )}
      
      {selectedUserType === 'Company' && (
        <CompanyRegisterForm 
          onBack={handleBackToSelection}
          onSuccess={() => handleRegisterSuccess('Company')}
        />
      )}
    </div>
  );
};

export default Register;