import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';

const SETTINGS_KEY = 'termo_saas_settings';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

const getInitialSettings = () => {
  const saved = localStorage.getItem(SETTINGS_KEY);
  const defaults = {
    systemName: 'Termo SaaS',
    primaryColor: '#ff4d4d', // Default Red
    institutionName: '',
    city: ''
  };
  
  if (saved) {
    try {
      return { ...defaults, ...JSON.parse(saved) };
    } catch (e) {
      return defaults;
    }
  }
  return defaults;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(getInitialSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'global');
    
    // Use onSnapshot for real-time updates across tabs/devices
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const updatedSettings = { ...settings, ...data };
        setSettings(updatedSettings);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to settings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings) => {
    try {
      const docRef = doc(db, 'settings', 'global');
      // Update local storage immediately for UI responsiveness
      const updatedSettings = { ...settings, ...newSettings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
      
      await setDoc(docRef, newSettings, { merge: true });
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Erro ao salvar configurações.');
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};
