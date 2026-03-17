import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Layout, Printer, Map, Settings, ChevronDown, Save, Loader } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';
import MapaSalaPrint from '../components/MapaSalaPrint';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const PageContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;

  @keyframes spin {
    100% { transform: rotate(360deg); }
  }
  .spin {
    animation: spin 1s linear infinite;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const TitleGroup = styled.div`
  h1 {
    font-size: 28px;
    font-weight: 800;
    margin: 0 0 8px 0;
    background: linear-gradient(135deg, #fff 0%, #a5a5a5 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
  }
  p {
    color: #888;
    margin: 0;
    font-size: 15px;
  }
`;

const Button = styled.button`
  background: ${props => props.$primary ? (props.$color || 'white') : 'transparent'};
  color: ${props => props.$primary ? 'white' : '#aaa'};
  border: 1px solid ${props => props.$primary ? 'transparent' : '#333'};
  padding: 14px 28px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background: ${props => props.$primary ? (props.$color || 'white') : '#252525'};
    color: white;
    transform: translateY(-2px);
    box-shadow: ${props => props.$primary ? `0 8px 20px ${props.$color}44` : 'none'};
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
`;

const Card = styled.div`
  background: #121212;
  border: 1px solid #222;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 13px;
    color: #aaa;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 12px;
  }

  input, select {
    background: #1a1a1a;
    border: 1px solid #333;
    padding: 12px 16px;
    border-radius: 10px;
    color: white;
    font-size: 15px;
    font-family: inherit;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: ${props => props.$primaryColor || '#666'};
      box-shadow: 0 0 0 3px ${props => props.$primaryColor ? `${props.$primaryColor}33` : 'rgba(255,255,255,0.1)'};
    }
  }
`;

const GridInputs = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ConfigSection = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  border: 1px solid #333;
  overflow: hidden;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const ConfigHeader = styled.div`
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: #222;

  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #eee;
  }
`;

const ConfigContent = styled.div`
  padding: 20px;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  border-top: 1px solid #333;
`;

const PreviewArea = styled.div`
  background: #0a0a0a;
  border: 1px dashed #333;
  border-radius: 12px;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 30px;
  overflow: hidden;
  overflow: auto;
  max-width: 100%;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const MapaSalaPanel = () => {
  const { settings } = useSettings();
  const primaryColor = settings?.primaryColor || '#ff4d4d';
  const componentRef = useRef(null);
  const [openConfig, setOpenConfig] = useState(true);
  const [formData, setFormData] = useState({
    serieTurma: '',
    numeroSala: '',
    cols: 5,
    rows: 6,
    professorPos: 'left', // left, center, right
    titlePos: 'center',    // left, center, right
    turmaPos: 'right',     // left, center, right
    doorSide: 'right',     // left, right
    doorPos: 'center',     // top, center, bottom
    headerPos: 'top',      // top, bottom
    windowSide: 'left',    // left, right, none
    chalkboardVisible: false
  });

  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'mapa_sala');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const savedData = docSnap.data();
          setFormData(prev => ({
            ...prev,
            cols: savedData.cols || prev.cols,
            rows: savedData.rows || prev.rows,
            professorPos: savedData.professorPos || prev.professorPos,
            titlePos: savedData.titlePos || prev.titlePos,
            turmaPos: savedData.turmaPos || prev.turmaPos,
            doorSide: savedData.doorSide || prev.doorSide,
            doorPos: savedData.doorPos || prev.doorPos,
            headerPos: savedData.headerPos || prev.headerPos,
            windowSide: savedData.windowSide || prev.windowSide,
            chalkboardVisible: savedData.chalkboardVisible ?? prev.chalkboardVisible
          }));
        }
      } catch (error) {
        console.error("Error loading saved settings:", error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const docRef = doc(db, 'settings', 'mapa_sala');
      const settingsToSave = {
        cols: formData.cols,
        rows: formData.rows,
        professorPos: formData.professorPos,
        titlePos: formData.titlePos,
        turmaPos: formData.turmaPos,
        doorSide: formData.doorSide,
        doorPos: formData.doorPos,
        headerPos: formData.headerPos,
        windowSide: formData.windowSide,
        chalkboardVisible: formData.chalkboardVisible,
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(docRef, settingsToSave, { merge: true });
      toast.success('Configurações salvas como padrão!');
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error('Erro ao salvar configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Mapa-de-Sala-${formData.serieTurma}`,
  });

  return (
    <PageContainer>
      <Header>
        <TitleGroup>
          <h1>Mapa de Sala</h1>
          <p>Gere e imprima esquemas de carteiras por sala.</p>
        </TitleGroup>
        <Button $primary $color={primaryColor} onClick={handlePrint}>
          <Printer size={18} /> Imprimir Mapa
        </Button>
      </Header>

      <PreviewArea>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>O mapa será gerado em formato A4 Paisagem (deitado).</p>
        <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
          <MapaSalaPrint data={formData} isPreview={true} scale={0.65} />
        </div>
      </PreviewArea>

      <FormGrid>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Layout size={20} color={primaryColor} />
            <h2 style={{ fontSize: '18px', margin: 0 }}>Informações da Sala</h2>
          </div>

          <GridInputs>
            <FormGroup $primaryColor={primaryColor}>
              <label>Série / Turma</label>
              <input 
                value={formData.serieTurma}
                onChange={e => setFormData({ ...formData, serieTurma: e.target.value })}
                placeholder="Ex: 1º ANO B"
              />
            </FormGroup>
            <FormGroup $primaryColor={primaryColor}>
              <label>Número / Identificação da Sala</label>
              <input 
                value={formData.numeroSala}
                onChange={e => setFormData({ ...formData, numeroSala: e.target.value })}
                placeholder="Ex: SALA 12"
              />
            </FormGroup>
          </GridInputs>

          <ConfigSection>
            <ConfigHeader onClick={() => setOpenConfig(!openConfig)}>
              <h3><Settings size={18} /> Configurações do Mapa</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Button 
                  $primary
                  $color={primaryColor}
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); handleSaveSettings(); }} 
                  disabled={isSaving}
                  style={{ padding: '6px 12px', fontSize: '11px', height: 'auto', textTransform: 'none' }}
                >
                  {isSaving ? <Loader size={14} className="spin" /> : <Save size={14} />}
                  {isSaving ? 'Salvando...' : 'Salvar como Padrão'}
                </Button>
                <ChevronDown size={18} style={{ transform: openConfig ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </div>
            </ConfigHeader>
            <ConfigContent $isOpen={openConfig}>
              <GridInputs>
                <FormGroup $primaryColor={primaryColor}>
                  <label>Colunas (Carteiras na horizontal)</label>
                  <input 
                    type="number"
                    min="1"
                    max="10"
                    value={formData.cols}
                    onChange={e => setFormData({ ...formData, cols: parseInt(e.target.value) || 1 })}
                  />
                </FormGroup>
                <FormGroup $primaryColor={primaryColor}>
                  <label>Linhas (Carteiras na vertical)</label>
                  <input 
                    type="number"
                    min="1"
                    max="15"
                    value={formData.rows}
                    onChange={e => setFormData({ ...formData, rows: parseInt(e.target.value) || 1 })}
                  />
                </FormGroup>
              </GridInputs>
              <GridInputs>
                <FormGroup $primaryColor={primaryColor}>
                  <label>Posição: Mesa do Professor</label>
                  <select 
                    value={formData.professorPos}
                    onChange={e => setFormData({ ...formData, professorPos: e.target.value })}
                  >
                    <option value="left">Esquerda (Topo)</option>
                    <option value="center">Centro (Topo)</option>
                    <option value="right">Direita (Topo)</option>
                  </select>
                </FormGroup>
                <FormGroup $primaryColor={primaryColor}>
                  <label>Posição: Título</label>
                  <select 
                    value={formData.titlePos}
                    onChange={e => setFormData({ ...formData, titlePos: e.target.value })}
                  >
                    <option value="left">Esquerda (Topo)</option>
                    <option value="center">Centro (Topo)</option>
                    <option value="right">Direita (Topo)</option>
                  </select>
                </FormGroup>
                <FormGroup $primaryColor={primaryColor}>
                  <label>Posição: Turma/Sala</label>
                  <select 
                    value={formData.turmaPos}
                    onChange={e => setFormData({ ...formData, turmaPos: e.target.value })}
                  >
                    <option value="left">Esquerda (Topo)</option>
                    <option value="center">Centro (Topo)</option>
                    <option value="right">Direita (Topo)</option>
                  </select>
                </FormGroup>
              </GridInputs>
              <br/>
              <GridInputs>
                <FormGroup $primaryColor={primaryColor}>
                  <label>Lado da Porta</label>
                  <select 
                    value={formData.doorSide}
                    onChange={e => setFormData({ ...formData, doorSide: e.target.value })}
                  >
                    <option value="right">Parede Direita</option>
                    <option value="left">Parede Esquerda</option>
                  </select>
                </FormGroup>
                <FormGroup $primaryColor={primaryColor}>
                  <label>Posição da Porta</label>
                  <select 
                    value={formData.doorPos}
                    onChange={e => setFormData({ ...formData, doorPos: e.target.value })}
                  >
                    <option value="top">Início (Cima)</option>
                    <option value="center">Centro</option>
                    <option value="bottom">Fim (Baixo)</option>
                  </select>
                </FormGroup>
                <FormGroup $primaryColor={primaryColor}>
                  <label>Posição do Cabeçalho</label>
                  <select 
                    value={formData.headerPos}
                    onChange={e => setFormData({ ...formData, headerPos: e.target.value })}
                  >
                    <option value="top">Topo (Início)</option>
                    <option value="bottom">Fundo (Fim)</option>
                  </select>
                </FormGroup>
                <FormGroup $primaryColor={primaryColor}>
                  <label>Lado das Janelas</label>
                  <select 
                    value={formData.windowSide}
                    onChange={e => setFormData({ ...formData, windowSide: e.target.value })}
                  >
                    <option value="left">Parede Esquerda</option>
                    <option value="right">Parede Direita</option>
                    <option value="none">Nenhuma</option>
                  </select>
                </FormGroup>
                <FormGroup $primaryColor={primaryColor}>
                  <label>Exibir Quadro (Opcional)</label>
                  <select 
                    value={formData.chalkboardVisible ? 'yes' : 'no'}
                    onChange={e => setFormData({ ...formData, chalkboardVisible: e.target.value === 'yes' })}
                  >
                    <option value="no">Não Exibir</option>
                    <option value="yes">Exibir Abaixo do Cabeçalho</option>
                  </select>
                </FormGroup>
              </GridInputs>
            </ConfigContent>
          </ConfigSection>

        </Card>
      </FormGrid>

      <MapaSalaPrint ref={componentRef} data={formData} />
    </PageContainer>
  );
};

export default MapaSalaPanel;
