import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import GeradorPanel from './pages/GeradorPanel';
import InventoryPanel from './pages/InventoryPanel';
import LabelGeneratorPanel from './pages/LabelGeneratorPanel';
import BilheteGeneratorPanel from './pages/BilheteGeneratorPanel';
import DashboardLayout from './components/DashboardLayout';
import SplashScreen from './components/SplashScreen';
import SettingsPanel from './pages/SettingsPanel';
import { SettingsProvider, useSettings } from './context/SettingsContext';

function AppContent() {
  const { loading: settingsLoading } = useSettings();
  const [splashLoading, setSplashLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashLoading(false);
    }, 2500); // Minimum splash time for premium feel
    return () => clearTimeout(timer);
  }, []);

  if (splashLoading || settingsLoading) return <SplashScreen />;

  return (
    <Router>
      <Toaster 
        /* keeps current Toaster config */
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '14px'
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/gerador-de-termos" replace />} />
        
        <Route path="/gerador-de-termos" element={
          <DashboardLayout>
            <GeradorPanel />
          </DashboardLayout>
        } />
        
        <Route path="/inventario" element={
          <DashboardLayout>
            <InventoryPanel />
          </DashboardLayout>
        } />

        <Route path="/etiquetas" element={
          <DashboardLayout>
            <LabelGeneratorPanel />
          </DashboardLayout>
        } />

        <Route path="/bilhetes" element={
          <DashboardLayout>
            <BilheteGeneratorPanel />
          </DashboardLayout>
        } />

        <Route path="/configuracoes" element={
          <DashboardLayout>
            <SettingsPanel />
          </DashboardLayout>
        } />
        
        <Route path="/logout" element={<Navigate to="/" replace />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}

export default App;
