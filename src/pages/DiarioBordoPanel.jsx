
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import {
  BookOpen, Printer, Users, Calendar, Layout, Info, Plus, Upload, Settings, 
  ChevronDown, RotateCcw, Bold, Type, Download, CheckCircle, HelpCircle, Columns, Maximize2, Save, Loader
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';
import DiarioBordoPrint from '../components/DiarioBordoPrint';
import * as XLSX from 'xlsx';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import schoolLogo from '../assets/logo-escola.png';

const PageContainer = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
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
    font-family: 'Outfit', sans-serif;
    font-size: 28px;
    color: white;
    margin: 0;
  }
  p {
    color: #888;
    font-size: 14px;
    margin-top: 4px;
  }
`;

const Card = styled.div`
  background: #141414;
  border: 1px solid #262626;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
`;

const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: #888;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  input, textarea {
    background: #0f0f0f;
    border: 1px solid #262626;
    border-radius: 8px;
    padding: 12px 16px;
    color: white;
    font-size: 15px;
    transition: all 0.2s;

    &:focus {
      border-color: ${props => props.$primaryColor || '#ff4d4d'};
      outline: none;
      background: #141414;
    }
  }

  textarea {
    min-height: 150px;
    resize: vertical;
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
  }
`;

const ConfigSection = styled.div`
  margin-top: 20px;
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #262626;
`;

const ConfigHeader = styled.div`
  padding: 16px 20px;
  background: #141414;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;

  h3 {
    font-size: 14px;
    font-weight: 700;
    color: white;
    margin: 0;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const ConfigContent = styled.div`
  padding: 20px;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  border-top: 1px solid #262626;
`;

const GridInputs = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`;

const Button = styled.button`
  background: ${props => props.$primary ? (props.$color || 'white') : '#1a1a1a'};
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
  width: ${props => props.$fullWidth ? '100%' : 'auto'};

  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
  .spin {
    animation: spin 1s linear infinite;
  }

  &:hover {
    background: ${props => props.$primary ? (props.$color || 'white') : '#252525'};
    color: white;
    transform: translateY(-2px);
    box-shadow: ${props => props.$primary ? `0 8px 20px ${props.$color}44` : 'none'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const PreviewArea = styled.div`
  background: #0a0a0a;
  border: 1px dashed #333;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  overflow: auto;
`;

const TooltipContainer = styled.div`
  position: relative;
  display: inline-flex;
  cursor: help;
  
  &:hover .tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateY(-5px);
  }
`;

const TooltipText = styled.div`
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%) translateY(0);
  background: #1a1a1a;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  width: 250px;
  line-height: 1.5;
  border: 1px solid #333;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: none;
  font-weight: 500;
  text-align: center;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
  }
`;

const PreviewSheet = styled.div`
  background: white;
  width: 100%;
  max-width: 1000px;
  aspect-ratio: 1.414 / 1;
  border-radius: 4px;
  padding: 4%;
  color: black;
  font-family: Arial, sans-serif;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  overflow: hidden;
  font-size: 10px;
  display: flex;
  flex-direction: column;
`;

const DiarioBordoPanel = () => {
  const { settings } = useSettings();
  const primaryColor = settings.primaryColor;
  const componentRef = useRef();
  const fileInputRef = useRef();

  const [openConfig, setOpenConfig] = useState(false);

  const defaultLabels = [
    "Perturbou a aula", "Chegou atrasado", "Sem material adequado", 
    "Desrespeito ao colega", "Desrespeito ao professor", "Não cumpriu as tarefas de sala",
    "Agressão verbal", "Agressão física", "Não fez o para casa",
    "Não apresentou o trabalho", "Ocorrência", "Convocação"
  ];

  const [importState, setImportState] = useState({
    headers: [],
    data: [],
    showPicker: false
  });

  const [formData, setFormData] = useState({
    turma: '',
    alunos: '',
    ano: '2026',
    mainTitle: 'Diário de Bordo Individual',
    schoolName: 'Escola Municipal SENADOR LEVINDO COELHO',
    studentLabel: 'Estudante:',
    columnLabels: [...defaultLabels],
    styles: {
      schoolNameBold: true,
      schoolNameSize: '10',
      mainTitleSize: '18',
      studentLabelSize: '18',
      columnsBold: false,
      logoSize: '60',
      rowCount: '25',
      borderWeight: '1',
      textAlignment: 'right'
    }
  });
  
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: '', type: '' });

  // Load saved settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'diario_bordo');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const savedData = docSnap.data();
          // Merge saved data with default structural data, but keep ephemeral data (turma, alunos) blank or default
          setFormData(prev => ({
            ...prev,
            mainTitle: savedData.mainTitle || prev.mainTitle,
            studentLabel: savedData.studentLabel || prev.studentLabel,
            columnLabels: savedData.columnLabels || prev.columnLabels,
            styles: {
              ...prev.styles,
              ...(savedData.styles || {})
            }
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
    setSaveMessage({ text: '', type: '' });
    try {
      const docRef = doc(db, 'settings', 'diario_bordo');
      const settingsToSave = {
        mainTitle: formData.mainTitle,
        studentLabel: formData.studentLabel,
        columnLabels: formData.columnLabels,
        styles: formData.styles,
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(docRef, settingsToSave, { merge: true });
      setSaveMessage({ text: 'Configurações salvas como padrão!', type: 'success' });
      setTimeout(() => setSaveMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveMessage({ text: 'Erro ao salvar. Tente novamente.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bstr = event.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (data.length > 0) {
          const nameKeywords = ['nome', 'aluno', 'estudante', 'student', 'name'];
          
          // 1. Find the likely header row
          let headerRowIndex = -1;
          let detectedColIndex = -1;

          for (let i = 0; i < Math.min(data.length, 20); i++) {
            const row = data[i];
            if (!row || !Array.isArray(row)) continue;
            
            const colIdx = row.findIndex(cell => 
              cell && typeof cell === 'string' && nameKeywords.some(key => cell.toLowerCase().trim() === key)
            );
            
            if (colIdx !== -1) {
              headerRowIndex = i;
              detectedColIndex = colIdx;
              break;
            }
          }

          // 2. Process data if found
          if (headerRowIndex !== -1) {
            const headers = data[headerRowIndex].map((h, i) => h ? String(h) : `Coluna ${i + 1}`);
            const dataRows = data.slice(headerRowIndex + 1);
            
            const names = dataRows
              .map(row => row[detectedColIndex])
              // Take everything that isn't completely empty to ensure we don't miss names with special formatting
              .filter(name => name !== undefined && name !== null && String(name).trim() !== '');
            
            setFormData(prev => ({
              ...prev,
              alunos: names.join('\n')
            }));
            toast.success(`${names.length} alunos importados da coluna "${headers[detectedColIndex]}" (Linha ${headerRowIndex + 1})!`);
            setImportState({ headers: [], data: [], showPicker: false });
          } else {
            // Fallback to old behavior if no clear header found
            const headers = data[0].map((h, i) => h ? String(h) : `Coluna ${i + 1}`);
            setImportState({ headers, data: data.slice(1), showPicker: true });
            toast.success("Escolha a coluna dos nomes.");
          }
        }
      } catch (error) {
        console.error("Error parsing file:", error);
        toast.error("Erro ao ler o arquivo. Verifique se é um CSV ou Excel válido.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const selectColumn = (index) => {
    const names = importState.data
      .map(row => row[index])
      .filter(name => name !== undefined && name !== null && String(name).trim() !== '');
    
    setFormData(prev => ({
      ...prev,
      alunos: names.join('\n')
    }));
    setImportState({ headers: [], data: [], showPicker: false });
    toast.success(`${names.length} alunos importados!`);
  };

  const handleLabelChange = (index, value) => {
    const newLabels = [...formData.columnLabels];
    newLabels[index] = value;
    setFormData(prev => ({ ...prev, columnLabels: newLabels }));
  };

  const setStyle = (key, value) => {
    setFormData(prev => ({
      ...prev,
      styles: { ...prev.styles, [key]: value }
    }));
  };

  const resetLabels = () => {
    setFormData(prev => ({ ...prev, columnLabels: [...defaultLabels] }));
    toast.success("Rótulos restaurados para o padrão.");
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Diario-de-Bordo-${formData.turma || 'Turma'}`,
  });

  const onPrintClick = () => {
    if (!formData.turma) {
      toast.error("Informe a Turma.");
      return;
    }
    if (!formData.alunos.trim()) {
      toast.error("Informe pelo menos um aluno.");
      return;
    }
    handlePrint();
  };

  const firstLetter = (name) => name ? name.trim().split('\n')[0] || "Exemplo" : "Exemplo";

  return (
    <PageContainer>
      <Header>
        <TitleGroup>
          <h1>Diário de Bordo Indivudal</h1>
          <p>Gere diários em massa para acompanhamento de alunos.</p>
        </TitleGroup>
        <Button $primary $color={primaryColor} onClick={onPrintClick}>
          <Printer size={18} /> Imprimir em Massa
        </Button>
      </Header>

      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', marginBottom: '15px' }}>
          <Layout size={16} />
          <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Pré-visualização do Modelo</span>
        </div>
        
          <PreviewArea style={{ borderStyle: 'solid', borderColor: '#262626' }}>
            <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
              <TooltipContainer>
                <Info size={20} color={primaryColor} />
                <TooltipText className="tooltip">
                  <strong>Dica Profissional:</strong><br/>
                  Mantenha as configurações de negrito e tamanho padrão para melhor legibilidade no papel A4. Use papel branco comum de 75g.
                </TooltipText>
              </TooltipContainer>
            </div>
            <PreviewSheet style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #ddd', paddingBottom: '5px', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={schoolLogo} alt="Logo" style={{ height: `${parseInt(formData.styles.logoSize) / 1.5}px`, objectFit: 'contain' }} />
                  </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontWeight: 400,
                    fontSize: `${parseInt(formData.styles.mainTitleSize) / 1.1}px`, // scaled for preview
                    textTransform: 'uppercase'
                  }}>{formData.mainTitle} {formData.ano} - Turma: {formData.turma || 'Turma'}</div>
                  <div style={{ 
                    fontWeight: 400,
                    fontSize: `${parseInt(formData.styles.studentLabelSize) / 1.1}px`, // scaled for preview
                    textTransform: 'uppercase'
                  }}>{formData.studentLabel} {firstLetter(formData.alunos).toUpperCase()}</div>
                </div>
            </div>
            
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid black', width: '30px', fontSize: '8px', padding: '2px', textTransform: 'uppercase', fontWeight: 500 }}>Data</th>
                    {formData.columnLabels.map((lbl, i) => (
                      <th key={i} style={{ 
                        border: '1px solid black', 
                        height: '110px', 
                        fontSize: '7px', 
                        position: 'relative',
                        textAlign: 'center',
                        fontWeight: 500,
                        color: 'black',
                        textTransform: 'uppercase',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          transform: 'rotate(-180deg)', 
                          writingMode: 'vertical-rl',
                          whiteSpace: 'nowrap',
                          margin: '0 auto',
                          height: '95px',
                          display: 'flex',
                          alignItems: 'center',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>{lbl}</div>
                      </th>
                    ))}
                    <th style={{ border: '1px solid black', width: 'auto', fontSize: '7px', textTransform: 'uppercase', fontWeight: 500 }}>Outras Ocorrências</th>
                    <th style={{ border: '1px solid black', width: '60px', fontSize: '7px', textTransform: 'uppercase', fontWeight: 500 }}>Assinatura</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 25 }).map((_, i) => (
                    <tr key={i}>
                      <td style={{ border: '1px solid black', height: '15px' }}></td>
                      {formData.columnLabels.map((_, j) => (
                        <td key={j} style={{ border: '1px solid black', height: '15px' }}></td>
                      ))}
                      <td style={{ border: '1px solid black', height: '15px' }}></td>
                      <td style={{ border: '1px solid black', height: '15px' }}></td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </PreviewSheet>
          <p style={{ color: '#555', fontSize: '12px' }}>
            Dica: Use papel A4 comum. A impressão será automática em modo paisagem.
          </p>
        </PreviewArea>
      </div>

      <FormGrid>
        <Card>
          <FormGroup $primaryColor={primaryColor}>
            <label><Layout size={16} /> Turma</label>
            <input 
              placeholder="Ex: 1º Ano A" 
              value={formData.turma}
              onChange={e => setFormData({ ...formData, turma: e.target.value })}
            />
          </FormGroup>

          <FormGroup $primaryColor={primaryColor}>
            <label><Calendar size={16} /> Ano Letivo</label>
            <input 
              placeholder="Ex: 2026" 
              value={formData.ano}
              onChange={e => setFormData({ ...formData, ano: e.target.value })}
            />
          </FormGroup>

          <FormGroup $primaryColor={primaryColor}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label><Users size={16} /> Lista de Alunos</label>
              <Button type="button" onClick={() => fileInputRef.current.click()} style={{ padding: '6px 12px', fontSize: '11px' }}>
                <Upload size={14} /> Importar Planilha
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileImport} 
                accept=".csv, .xlsx, .xls" 
                style={{ display: 'none' }} 
              />
            </div>

            {importState.showPicker && (
              <div style={{ background: '#1a1a1a', border: '1px solid #262626', borderRadius: '8px', padding: '15px', marginBottom: '15px', animation: 'fadeIn 0.3s ease' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: primaryColor, marginBottom: '10px', textTransform: 'uppercase' }}>
                  Escolha a coluna que contém os nomes:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {importState.headers.map((h, i) => (
                    <Button key={i} onClick={() => selectColumn(i)} style={{ padding: '6px 10px', fontSize: '11px', background: '#262626' }}>
                      {h}
                    </Button>
                  ))}
                  <Button onClick={() => setImportState({ ...importState, showPicker: false })} style={{ padding: '6px 10px', fontSize: '11px', background: 'transparent', color: '#666' }}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
            <textarea 
              placeholder="João Silva\nMaria Oliveira\n..." 
              value={formData.alunos}
              onChange={e => setFormData({ ...formData, alunos: e.target.value })}
            />
          </FormGroup>

          <ConfigSection>
            <ConfigHeader onClick={() => setOpenConfig(!openConfig)}>
              <h3><Settings size={16} /> Configurações da Página</h3>
              <ChevronDown size={18} style={{ transform: openConfig ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </ConfigHeader>
            <ConfigContent $isOpen={openConfig}>
              <FormGroup $primaryColor={primaryColor}>
                <label>Título do Documento</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    style={{ flex: 1 }}
                    value={formData.mainTitle}
                    onChange={e => setFormData(prev => ({ ...prev, mainTitle: e.target.value }))}
                  />
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input 
                      type="number"
                      value={formData.styles.mainTitleSize}
                      onChange={e => setStyle('mainTitleSize', e.target.value)}
                      style={{ width: '60px', padding: '8px', fontSize: '12px' }}
                    />
                  </div>
                </div>
              </FormGroup>

              <FormGroup $primaryColor={primaryColor}>
                <label>Tamanho da Logo (Altura px)</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="range"
                    min="20"
                    max="100"
                    style={{ flex: 1 }}
                    value={formData.styles.logoSize}
                    onChange={e => setStyle('logoSize', e.target.value)}
                  />
                  <input 
                    type="number"
                    value={formData.styles.logoSize}
                    onChange={e => setStyle('logoSize', e.target.value)}
                    style={{ width: '60px', padding: '8px', fontSize: '12px' }}
                  />
                </div>
              </FormGroup>
              
              <FormGroup $primaryColor={primaryColor}>
                <label>Rótulo do Estudante</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    style={{ flex: 1 }}
                    value={formData.studentLabel}
                    onChange={e => setFormData(prev => ({ ...prev, studentLabel: e.target.value }))}
                  />
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input 
                      type="number"
                      value={formData.styles.studentLabelSize}
                      onChange={e => setStyle('studentLabelSize', e.target.value)}
                      style={{ width: '60px', padding: '8px', fontSize: '12px' }}
                    />
                  </div>
                </div>
              </FormGroup>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label style={{ fontSize: '12px', color: '#888', fontWeight: 600 }}>RÓTULOS DAS COLUNAS (12)</label>
                  <Button type="button" onClick={() => setStyle('columnsBold', !formData.styles.columnsBold)} style={{ padding: '4px 8px', fontSize: '10px', background: formData.styles.columnsBold ? primaryColor : '#262626', color: 'white' }}>
                    <Bold size={12} /> Negrito GERAL
                  </Button>
                </div>
                <Button type="button" onClick={resetLabels} style={{ padding: '4px 8px', fontSize: '10px' }}>
                  <RotateCcw size={12} /> Resetar Nomes
                </Button>
              </div>

              <div style={{ padding: '15px', background: '#1a1a1a', borderRadius: '8px', marginBottom: '20px', border: '1px solid #333' }}>
                <label style={{ fontSize: '13px', color: primaryColor, fontWeight: 700, display: 'block', marginBottom: '15px', textTransform: 'uppercase' }}>
                  Configurações Avançadas de Layout
                </label>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                  <FormGroup $primaryColor={primaryColor}>
                    <label>Quantidade de Linhas</label>
                    <input 
                      type="number"
                      value={formData.styles.rowCount}
                      onChange={e => setStyle('rowCount', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup $primaryColor={primaryColor}>
                    <label>Espessura das Bordas</label>
                    <input 
                      type="number"
                      step="0.5"
                      value={formData.styles.borderWeight}
                      onChange={e => setStyle('borderWeight', e.target.value)}
                    />
                  </FormGroup>

                  <FormGroup $primaryColor={primaryColor}>
                    <label>Alinhamento do Cabeçalho</label>
                    <select 
                      value={formData.styles.textAlignment}
                      onChange={e => setStyle('textAlignment', e.target.value)}
                      style={{ padding: '8px', background: '#262626', border: '1px solid #333', color: 'white', borderRadius: '4px' }}
                    >
                      <option value="left">Esquerda</option>
                      <option value="center">Centralizado</option>
                      <option value="right">Direita</option>
                    </select>
                  </FormGroup>
                </div>
                <div style={{ display: 'flex', gridColumn: '1 / -1', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <Button 
                    type="button" 
                    $primary 
                    $color={primaryColor}
                    onClick={handleSaveSettings}
                    disabled={isSaving || isLoadingSettings}
                    style={{ padding: '8px 16px', fontSize: '12px' }}
                  >
                    {isSaving ? <Loader size={16} className="spin" /> : <Save size={16} />}
                    {isSaving ? 'Salvando...' : 'Salvar Configurações como Padrão'}
                  </Button>
                </div>
                {saveMessage.text && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'right', fontSize: '12px', color: saveMessage.type === 'success' ? '#4ade80' : '#ef4444', marginTop: '5px' }}>
                    {saveMessage.text}
                  </div>
                )}
              </div>

              <GridInputs>
                {formData.columnLabels.map((label, idx) => (
                  <FormGroup key={idx} $primaryColor={primaryColor} style={{ marginBottom: '10px' }}>
                    <input 
                      style={{ fontSize: '12px', padding: '8px' }}
                      value={label}
                      onChange={e => handleLabelChange(idx, e.target.value)}
                    />
                  </FormGroup>
                ))}
              </GridInputs>
            </ConfigContent>
          </ConfigSection>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666', background: '#1a1a1a', padding: '15px', borderRadius: '8px', fontSize: '13px' }}>
            <BookOpen size={18} color={primaryColor} />
            <span>O sistema gerará uma página paisagem (A4) para cada nome listado acima.</span>
          </div>
        </Card>
      </FormGrid>

      <DiarioBordoPrint ref={componentRef} data={formData} />
    </PageContainer>
  );
};

export default DiarioBordoPanel;
