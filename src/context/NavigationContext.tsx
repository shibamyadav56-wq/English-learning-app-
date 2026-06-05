import React, { createContext, useContext, useState } from 'react';

interface NavigationContextType {
  isNavVisible: boolean;
  setIsNavVisible: (visible: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNavVisible, setIsNavVisible] = useState(true);
  return (
    <NavigationContext.Provider value={{ isNavVisible, setIsNavVisible }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
