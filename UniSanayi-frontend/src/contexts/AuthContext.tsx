import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  userType: 'Student' | 'Company';
  isActive: boolean;
  emailVerified: boolean;
}

export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  university: string;
  department: string;
  isAvailable: boolean;
}

export interface CompanyProfile {
  id: string;
  companyName: string;
  industry: string;
  isVerified: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  student: StudentProfile | null;
  company: CompanyProfile | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User, profile?: StudentProfile | CompanyProfile) => void;
  logout: () => void;
  updateProfile: (profile: StudentProfile | CompanyProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'unisanayi_token';
const USER_KEY = 'unisanayi_user';
const PROFILE_KEY = 'unisanayi_profile';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    student: null,
    company: null,
    token: null,
    loading: true,
  });

  // Sayfa yüklendiğinde localStorage'dan token kontrolü
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const userStr = localStorage.getItem(USER_KEY);
        const profileStr = localStorage.getItem(PROFILE_KEY);

        if (token && userStr) {
          const user = JSON.parse(userStr) as User;
          const profile = profileStr ? JSON.parse(profileStr) : null;

          setAuthState({
            isAuthenticated: true,
            user,
            student: user.userType === 'Student' ? profile : null,
            company: user.userType === 'Company' ? profile : null,
            token,
            loading: false,
          });
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Hatalı veri varsa temizle
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(PROFILE_KEY);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    initAuth();
  }, []);

  const login = (token: string, user: User, profile?: StudentProfile | CompanyProfile) => {
    try {
      // Token'ı localStorage'a kaydet
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      if (profile) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      }

      // State'i güncelle
      setAuthState({
        isAuthenticated: true,
        user,
        student: user.userType === 'Student' ? profile as StudentProfile : null,
        company: user.userType === 'Company' ? profile as CompanyProfile : null,
        token,
        loading: false,
      });

      console.log('Login successful:', user.email, user.userType);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = () => {
    try {
      // localStorage'ı temizle
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(PROFILE_KEY);

      // State'i sıfırla
      setAuthState({
        isAuthenticated: false,
        user: null,
        student: null,
        company: null,
        token: null,
        loading: false,
      });

      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = (profile: StudentProfile | CompanyProfile) => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      
      setAuthState(prev => ({
        ...prev,
        student: prev.user?.userType === 'Student' ? profile as StudentProfile : prev.student,
        company: prev.user?.userType === 'Company' ? profile as CompanyProfile : prev.company,
      }));
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};