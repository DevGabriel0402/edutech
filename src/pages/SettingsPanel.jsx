import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSettings } from '../context/SettingsContext';
import { Settings, Palette, Type, Save, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding-bottom: 40px;
  }
`;

const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  color: white;
  margin-bottom: 8px;

  @media (max-width: 600px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  color: #888;
  margin-bottom: 30px;
  font-size: 14px;
`;

const Card = styled.div`
  background: #141414;
  border: 1px solid #262626;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  @media (max-width: 600px) {
    padding: 20px;
  }
`;

const SectionTitle = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-size: 18px;
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
  
  svg {
    color: ${props => props.$color || '#ff4d4d'};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: #888;
  }

  input {
    background: #0f0f0f;
    border: 1px solid #262626;
    border-radius: 8px;
    padding: 12px 16px;
    color: white;
    font-size: 14px;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: ${props => props.$color || '#ff4d4d'};
      box-shadow: 0 0 0 2px ${props => (props.$color || '#ff4d4d') + '22'};
    }
  }
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 12px;
  margin-top: 8px;

  @media (max-width: 600px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const ColorCircle = styled.div`
  aspect-ratio: 1;
  border-radius: 8px;
  background: ${props => props.$bg};
  cursor: pointer;
  border: 2px solid ${props => props.$active ? 'white' : 'transparent'};
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const CustomColorInput = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #222;

  input[type="color"] {
    -webkit-appearance: none;
    border: none;
    width: 40px;
    height: 40px;
    background: transparent;
    cursor: pointer;
    
    &::-webkit-color-swatch-wrapper {
      padding: 0;
    }
    &::-webkit-color-swatch {
      border: 1px solid #333;
      border-radius: 8px;
    }
  }
`;

const Button = styled.button`
  background: ${props => props.$primary ? (props.$color || '#ff4d4d') : 'transparent'};
  color: ${props => props.$primary ? 'white' : '#888'};
  border: ${props => props.$primary ? 'none' : '1px solid #333'};
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    ${props => !props.$primary && 'border-color: #666; color: white;'}
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ActionGrid = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;

  @media (max-width: 600px) {
    flex-direction: column-reverse;
    
    button {
      width: 100%;
      justify-content: center;
    }
  }
`;

const PRESET_COLORS = [
  '#ff4d4d', // Red (Default)
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#6366f1', // Indigo
];

const SettingsPanel = () => {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState({
    systemName: settings.systemName,
    primaryColor: settings.primaryColor
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData({
      systemName: settings.systemName,
      primaryColor: settings.primaryColor
    });
  }, [settings]);

  const handleSave = async () => {
    if (!formData.systemName.trim()) {
      toast.error("O nome do sistema não pode estar vazio.");
      return;
    }
    
    setSaving(true);
    try {
      await updateSettings(formData);
    } catch (error) {
      // toast already handled in context
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      systemName: 'Termo SaaS',
      primaryColor: '#ff4d4d'
    });
  };

  return (
    <Container>
      <Title>Configurações do Sistema</Title>
      <Subtitle>Personalize a identidade visual e o nome do seu SaaS.</Subtitle>

      <Card>
        <SectionTitle $color={formData.primaryColor}>
          <Type size={20} /> Identidade do Sistema
        </SectionTitle>
        <FormGroup $color={formData.primaryColor}>
          <label>Nome do Sistema (Exibido na Barra Lateral)</label>
          <input 
            value={formData.systemName}
            onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
            placeholder="Ex: Gerador de Termos Academy"
          />
        </FormGroup>
      </Card>

      <Card>
        <SectionTitle $color={formData.primaryColor}>
          <Palette size={20} /> Personalização de Cores
        </SectionTitle>
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '16px' }}>
          Selecione a cor principal que será aplicada em botões, links ativos e destaques.
        </p>
        
        <ColorGrid>
          {PRESET_COLORS.map(color => (
            <ColorCircle 
              key={color} 
              $bg={color} 
              $active={formData.primaryColor === color}
              onClick={() => setFormData({ ...formData, primaryColor: color })}
            />
          ))}
        </ColorGrid>

        <CustomColorInput>
          <input 
            type="color" 
            value={formData.primaryColor}
            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', color: '#888', fontWeight: 600 }}>Cor Personalizada</span>
            <span style={{ fontSize: '12px', color: '#555', fontFamily: 'monospace' }}>{formData.primaryColor.toUpperCase()}</span>
          </div>
        </CustomColorInput>
      </Card>

      <ActionGrid>
        <Button onClick={handleReset}>
          <RotateCcw size={18} /> Restaurar Padrões
        </Button>
        <Button $primary $color={formData.primaryColor} onClick={handleSave} disabled={saving}>
          <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </ActionGrid>
    </Container>
  );
};

export default SettingsPanel;
