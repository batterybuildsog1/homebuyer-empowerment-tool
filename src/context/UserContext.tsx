
import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserContextType {
  isLoggedIn: boolean;
  userName: string | null;
  login: (name: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  
  // Check local storage for login state on mount
  useEffect(() => {
    const storedLoginState = localStorage.getItem('userLoggedIn') === 'true';
    const storedUserName = localStorage.getItem('userName');
    
    setIsLoggedIn(storedLoginState);
    setUserName(storedUserName);
  }, []);
  
  const login = (name: string) => {
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userName', name);
    setIsLoggedIn(true);
    setUserName(name);
  };
  
  const logout = () => {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setUserName(null);
  };
  
  return (
    <UserContext.Provider value={{ isLoggedIn, userName, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
