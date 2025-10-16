import { createContext, useContext, useState, useCallback } from 'react';

const AlertContext = createContext();

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = useCallback(({
    variant = 'info',
    title,
    message,
    autoClose = true,
    autoCloseDuration = 5000
  }) => {
    const id = Date.now() + Math.random();
    const newAlert = {
      id,
      variant,
      title,
      message,
      autoClose,
      autoCloseDuration
    };

    setAlerts((prev) => [...prev, newAlert]);
    return id;
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert, clearAlerts }}>
      {children}
    </AlertContext.Provider>
  );
};
