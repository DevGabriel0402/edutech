import React, { useState } from 'react';
import styled from 'styled-components';
import { NavLink, useNavigate } from 'react-router-dom';
import { FileText, Box, Tag, Layout, LogOut, Settings as SettingsIcon, Bell, Search, Menu, X, User, Edit3, Shield, Star, Crown, Mail, BookOpen, Map
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #0a0a0a;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.aside`
  width: 260px;
  background: #0d0d0d;
  border-right: 1px solid #1a1a1a;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #333 #0d0d0d;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 3px;
  }

  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'flex' : 'none'};
    right: 0;
    width: 100%;
  }
`;

const Topbar = styled.header`
  height: 65px;
  background: rgba(13, 13, 13, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: fixed;
  top: 0;
  left: 260px;
  right: 0;
  z-index: 1000;
  transition: all 0.2s;

  @media (max-width: 768px) {
    left: 0;
    padding: 0 16px;
  }
`;

const Tabbar = styled.nav`
  display: none;
  background: rgba(13, 13, 13, 0.9);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  z-index: 1000;
  padding: 0 8px;
  justify-content: flex-start;
  align-items: center;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const BrandArea = styled.div`
  padding: 32px 24px;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Logo = styled.div`
  width: 32px;
  height: 32px;
  background: ${props => props.$color || '#ff4d4d'};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px ${props => (props.$color || '#ff4d4d') + '44'};

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
  }
`;

const BrandName = styled.span`
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: white;
  letter-spacing: -0.5px;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const NavList = styled.nav`
  padding: 10px 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  color: #888;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.03);
  }

  &.active {
    color: white;
    background: ${props => (props.$color || '#ff4d4d') + '14'};
    border-color: ${props => (props.$color || '#ff4d4d') + '22'};
    
    svg {
      color: ${props => props.$color || '#ff4d4d'};
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 4px;
    padding: 8px 4px;
    font-size: 10px;
    background: none !important;
    border: none !important;
    color: #666;
    
    &.active {
      color: ${props => props.$color || '#ff4d4d'};
      background: none !important;
      border: none !important;
    }
    
    svg {
      width: 20px;
      height: 20px;
    }

    /* Prevent text wrapping to keep items in a row */
    white-space: nowrap;
    min-width: 80px;
  }
`;

const TopbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #aaa;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: white;
    border-color: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 768px) {
    padding: 8px;
    span { display: none; }
  }
`;

const LogoutButton = styled(ActionButton)`
  background: rgba(239, 68, 68, 0.05);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.1);

  &:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ff5f5f;
    border-color: rgba(239, 68, 68, 0.2);
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 260px;
  margin-top: 65px;
  padding: 40px;
  max-width: 1400px;
  width: 100%;

  @media (max-width: 1024px) {
    padding: 30px;
  }

  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 65px;
    margin-bottom: 70px;
    padding: 20px;
  }
`;

const DashboardLayout = ({ children }) => {
  const { settings } = useSettings();
  const { userData, logout } = useAuth();
  const primaryColor = settings.primaryColor;
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <LayoutContainer>
      {/* Desktop Sidebar */}
      <Sidebar $isOpen={mobileMenuOpen}>
        <BrandArea>
          <Logo $color={primaryColor}><Layout size={18} /></Logo>
          <BrandName>{settings.systemName}</BrandName>
        </BrandArea>

        <NavList>
          <NavItem to="/gerador-de-termos" $color={primaryColor}>
            <FileText size={20} />
            Gerador de Termos
          </NavItem>
          <NavItem to="/inventario" $color={primaryColor}>
            <Box size={20} />
            Inventário
          </NavItem>
          <NavItem to="/etiquetas" $color={primaryColor}>
            <Tag size={20} />
            Etiquetas
          </NavItem>
          <NavItem to="/bilhetes" $color={primaryColor}>
            <Mail size={20} />
            Bilhetes
          </NavItem>
          <NavItem to="/diario-de-bordo" $color={primaryColor} onClick={() => setMobileMenuOpen(false)}>
            <BookOpen size={20} />
            Diário de Bordo
          </NavItem>
          <NavItem to="/mapa-sala" $color={primaryColor} onClick={() => setMobileMenuOpen(false)}>
            <Map size={20} />
            Mapa de Sala
          </NavItem>
        </NavList>

        <div style={{ padding: '20px', borderTop: '1px solid #1a1a1a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '8px', 
              background: primaryColor + '22', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: primaryColor, 
              fontSize: '12px', 
              fontWeight: 700 
            }}>
              {userData?.name?.substring(0, 2).toUpperCase() || 'GT'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ color: 'white', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userData?.name || 'Gestor TI'}
              </span>
              <span style={{ color: '#555', fontSize: '11px', textTransform: 'capitalize' }}>
                {userData?.role || 'Painel de Gestão'}
              </span>
            </div>
          </div>
        </div>
      </Sidebar>

      {/* Global Topbar */}
      <Topbar>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'none', alignItems: 'center', gap: '8px' }} className="mobile-only">
             {/* Shown only on mobile via inline style or media query logic */}
          </div>
          <BrandArea style={{ padding: 0, display: window.innerWidth <= 768 ? 'flex' : 'none' }}>
            <Logo $color={primaryColor}><Layout size={16} /></Logo>
            <BrandName>{settings.systemName}</BrandName>
          </BrandArea>
        </div>

        <TopbarActions>
          <ActionButton onClick={() => navigate('/configuracoes')}>
            <SettingsIcon size={18} />
            <span>Configurações</span>
          </ActionButton>
          <LogoutButton onClick={handleLogout}>
            <LogOut size={18} />
            <span>Sair</span>
          </LogoutButton>
        </TopbarActions>
      </Topbar>

      {/* Content Area */}
      <MainContent>
        {children}
      </MainContent>

      {/* Mobile Tabbar */}
      <Tabbar>
        <NavItem to="/gerador-de-termos" $color={primaryColor}>
          <FileText size={22} />
          Termos
        </NavItem>
        <NavItem to="/inventario" $color={primaryColor}>
          <Box size={22} />
          Inventário
        </NavItem>
        <NavItem to="/etiquetas" $color={primaryColor}>
          <Tag size={22} />
          Etiquetas
        </NavItem>
        <NavItem to="/bilhetes" $color={primaryColor}>
          <Mail size={22} />
          Bilhetes
        </NavItem>
        <NavItem to="/diario-de-bordo" $color={primaryColor}>
          <BookOpen size={22} />
          Diário
        </NavItem>
        <NavItem to="/mapa-sala" $color={primaryColor}>
          <Map size={22} />
          Mapa
        </NavItem>
      </Tabbar>
    </LayoutContainer>
  );
};

export default DashboardLayout;
