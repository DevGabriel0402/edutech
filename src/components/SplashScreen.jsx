import React from 'react';
import styled, { keyframes } from 'styled-components';
import { ShieldCheck } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const progress = keyframes`
  0% { width: 0%; }
  100% { width: 100%; }
`;

const SplashContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: ${fadeIn} 0.5s ease-out;
`;

const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: ${pulse} 2s infinite ease-in-out;
`;

const IconWrapper = styled.div`
  background: rgba(255, 77, 77, 0.1);
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(255, 77, 77, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 24px;
  color: white;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 13px;
  margin-top: 5px;
`;

const ProgressContainer = styled.div`
  width: 200px;
  height: 2px;
  background: #1a1a1a;
  border-radius: 10px;
  margin-top: 40px;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 100%;
  background: ${props => props.$color || '#ff4d4d'};
  animation: ${progress} 2s ease-in-out forwards;
`;

const SplashScreen = () => {
  const { settings } = useSettings();
  const primaryColor = settings.primaryColor;

  return (
    <SplashContainer>
      <LogoContainer>
        <IconWrapper style={{
          background: `${primaryColor}1a`,
          borderColor: `${primaryColor}33`
        }}>
          <ShieldCheck size={48} color={primaryColor} />
        </IconWrapper>
        <div style={{ textAlign: 'center' }}>
          <Title>{settings.systemName}</Title>
          <Subtitle>Seu inventário virtual</Subtitle>
        </div>
      </LogoContainer>
      <ProgressContainer>
        <ProgressBar $color={primaryColor} />
      </ProgressContainer>
    </SplashContainer>
  );
};

export default SplashScreen;
