import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styled from 'styled-components';
import { 
  Mail, Printer, Layout, Type, Edit2, Save, ChevronDown, 
  User, Info, PlusCircle, Palette, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, Share2, Clipboard, Database, Calendar,
  Bold, Italic, Maximize, Move
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import BilhetePrint from '../components/BilhetePrint';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const PageContainer = styled.div`
  padding: 20px;
  animation: fadeIn 0.5s ease-out;
  max-width: 1000px;
  margin: 0 auto;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
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
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
`;

const AccordionItem = styled.div`
  border-bottom: 1px solid #262626;
  &:last-child { border-bottom: none; }
`;

const AccordionHeader = styled.div`
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: ${props => props.$isOpen ? '#1a1a1a' : 'transparent'};
  transition: all 0.2s;
  
  &:hover { background: #1a1a1a; }
  
  h3 {
    font-size: 14px;
    font-weight: 700;
    color: ${props => props.$isOpen ? 'white' : '#888'};
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
  }
`;

const AccordionContent = styled.div`
  padding: ${props => props.$isOpen ? '24px' : '0'};
  max-height: ${props => props.$isOpen ? '1500px' : '0'};
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #0d0d0d;
`;

const MainGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  align-items: stretch;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;

  label {
    font-size: 12px;
    font-weight: 700;
    color: #666;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const Input = styled.input`
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
    box-shadow: 0 0 0 2px ${props => props.$primaryColor}22;
  }
`;

const QuillWrapper = styled.div`
  background: #0f0f0f;
  border: 1px solid #262626;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 4px;

  .ql-toolbar {
    background: #1a1a1a;
    border: none;
    border-bottom: 1px solid #333;
  }

  .ql-container {
    border: none;
    min-height: 150px;
    font-size: 15px;
    color: white;
  }

  .ql-editor {
    min-height: 150px;
    line-height: 1.6;
    
    &.ql-blank::before {
      color: #555;
      font-style: normal;
    }
  }

  .ql-stroke {
    stroke: #888 !important;
  }

  .ql-fill {
    fill: #888 !important;
  }

  .ql-picker {
    color: #888 !important;
  }
`;

const Button = styled.button`
  background: ${props => props.$primary ? (props.$color || 'white') : '#1a1a1a'};
  color: ${props => props.$primary ? 'white' : '#aaa'};
  border: 1px solid ${props => props.$primary ? 'transparent' : '#333'};
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${props => props.$primary ? (props.$color || 'white') : '#252525'};
    color: white;
    transform: translateY(-1px);
    box-shadow: ${props => props.$primary ? `0 4px 12px ${props.$color}44` : 'none'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
  margin-top: 10px;
`;

const SignatoryOption = styled.button`
  background: ${props => props.$active ? (props.$color + '14') : '#0f0f0f'};
  border: 1px solid ${props => props.$active ? props.$color : '#262626'};
  color: ${props => props.$active ? 'white' : '#888'};
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.$color};
    color: white;
  }
`;

const ControlGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 15px;
  margin-top: 10px;
`;

const AlignButton = styled.button`
  background: ${props => props.$active ? (props.$color + '14') : '#0f0f0f'};
  border: 1px solid ${props => props.$active ? props.$color : '#262626'};
  color: ${props => props.$active ? 'white' : '#666'};
  padding: 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;

  &:hover {
    border-color: ${props => props.$color};
    color: white;
  }
`;

const Select = styled.select`
  background: #0f0f0f;
  border: 1px solid #262626;
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  font-size: 15px;
  transition: all 0.2s;
  cursor: pointer;

  &:focus {
    border-color: ${props => props.$primaryColor || '#ff4d4d'};
    outline: none;
  }
`;

const ColorInput = styled.input`
  width: 100%;
  height: 40px;
  padding: 0;
  border: 1px solid #262626;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  &::-webkit-color-swatch-wrapper { padding: 0; }
  &::-webkit-color-swatch { border: none; border-radius: 8px; }
`;

const PreviewCard = styled.div`
  margin-top: 40px;
  background: #0a0a0a;
  border: 1px dashed #333;
  border-radius: 12px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const BilhetePreview = styled.div`
  width: 100%;
  max-width: 600px;
  background: white;
  color: black;
  padding: 30px;
  border-radius: 4px;
`;

const SIGNATORY_OPTIONS = [
  'Direção',
  'Coordenação de turno',
  'Coordenação Geral',
  'Coordenação da Integrada',
  'custom'
];

const PRESET_TEMPLATES = [
  {
    id: 'feriado',
    name: 'Feriado/Ponte',
    text: 'Prezados pais, informamos que no dia {data} não haverá aula devido ao feriado. Retornaremos normalmente na {dia_retorno}.',
    icon: <Calendar size={16} />
  },
  {
    id: 'material',
    name: 'Material Faltante',
    text: 'Olá! Notamos que o aluno(a) está sem o material: {item}. Pedimos a gentileza de providenciar para as atividades em sala.',
    icon: <Mail size={16} />
  },
  {
    id: 'reuniao',
    name: 'Convocação Reunião',
    text: 'Convidamos os responsáveis para uma reunião pedagógica no dia {data} às {hora}. Sua presença é fundamental!',
    icon: <User size={16} />
  }
];

const BilheteGeneratorPanel = () => {
  const { settings } = useSettings();
  const primaryColor = settings.primaryColor;
  const componentRef = useRef();

  const [formData, setFormData] = useState({
    schoolName: 'Escola Municipal Senador Levindo Coelho',
    city: 'Belo Horizonte',
    content: '',
    signatory: 'Direção',
    customSignatory: '',
    copyCount: 4,
    quantity: '4', 
    schoolFontSize: 16,
    contentFontSize: 12,
    signatoryFontSize: 11,
    contentAlign: 'justify',
    signatureAlign: 'center',
    titleAlign: 'left',
    logoSize: 40,
    lineHeight: 1.5,
    paddingX: 20,
    paddingY: 20,
    bgColor: '#ffffff',
    textColor: '#000000',
    borderColor: '#eeeeee',
    fontFamily: 'Inter',
    isBold: false,
    isItalic: false,
    variables: {
      data: format(new Date(), 'dd/MM'),
      dia_retorno: '',
      item: '',
      hora: ''
    }
  });

  const [openSection, setOpenSection] = useState('templates');

  const replaceVariables = (text) => {
    if (!text) return '';
    let newText = text;
    Object.keys(formData.variables).forEach(key => {
      const value = formData.variables[key];
      const regex = new RegExp(`{${key}}`, 'g');
      newText = newText.replace(regex, (value !== undefined && value !== null && value !== '') ? value : `{${key}}`);
    });
    return newText;
  };

  const handleVariableChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      variables: {
        ...prev.variables,
        [name]: value
      }
    }));
  };

  const loadTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      content: template.text
    }));
    toast.success(`Modelo "${template.name}" carregado!`);
  };

  const copyToWhatsApp = () => {
    const header = `*${formData.schoolName.toUpperCase()}*\n_Comunicado Escolar_\n\n`;
    const bodyHtml = replaceVariables(formData.content);
    // Strip HTML tags for WhatsApp
    const bodyPlain = bodyHtml.replace(/<[^>]*>/g, '');
    const footer = `\n\n_${formData.city}, ${format(new Date(), "dd/MM/yyyy")}_\n*${formData.signatory === 'custom' ? formData.customSignatory : formData.signatory}*`;

    const fullText = header + bodyPlain + footer;

    navigator.clipboard.writeText(fullText).then(() => {
      toast.success('Texto copiado para o WhatsApp! 📱');
    }).catch(() => {
      toast.error('Erro ao copiar texto.');
    });
  };

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSavedTemplate = async () => {
      try {
        const docRef = doc(db, 'settings', 'bilheteTemplate');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const savedData = docSnap.data();
          setFormData(prev => ({ 
            ...prev, 
            ...savedData,
            // Ensure variables exist even in old saved data
            variables: { ...prev.variables, ...(savedData.variables || {}) }
          }));
        }
      } catch (error) {
        console.error("Error loading template:", error);
      }
    };
    loadSavedTemplate();
  }, []);

  const handleSaveTemplate = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'bilheteTemplate'), formData);
      toast.success("Modelo de bilhete salvo com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar modelo.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const printResult = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Bilhete - ${formData.schoolName}`,
  });

  const handlePrint = typeof printResult === 'function' ? printResult : printResult?.handlePrint;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value 
    }));
  };

  const getSignatoryLabel = (s) => {
    if (s === 'custom') return 'Personalizado...';
    return s;
  };

  return (
    <PageContainer>
      <Header>
        <TitleGroup>
          <h1>Gerador de Bilhetes</h1>
          <p>Crie comunicados escolares rápidos e padronizados.</p>
        </TitleGroup>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Button onClick={handlePrint} $primary $color={primaryColor} style={{ flex: 1, minWidth: '150px' }}>
            <Printer size={18} /> Imprimir
          </Button>
          <Button onClick={copyToWhatsApp} $primary $color="#25D366" style={{ flex: 1, minWidth: '150px' }}>
            <Share2 size={18} /> WhatsApp
          </Button>
          <Button onClick={handleSaveTemplate} disabled={saving} style={{ flex: 1, minWidth: '150px' }}>
            <Save size={18} /> {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </Header>

      <MainGrid>
        <Card>
          <AccordionItem>
            <AccordionHeader $isOpen={openSection === 'templates'} onClick={() => setOpenSection(prev => prev === 'templates' ? null : 'templates')}>
              <h3><Database size={18} /> Modelos Prontos</h3>
              <ChevronDown size={20} style={{ transform: openSection === 'templates' ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </AccordionHeader>
            <AccordionContent $isOpen={openSection === 'templates'}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                {PRESET_TEMPLATES.map(tmpl => (
                  <SignatoryOption 
                    key={tmpl.id} 
                    onClick={() => loadTemplate(tmpl)}
                    $color={primaryColor}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {tmpl.icon}
                    {tmpl.name}
                  </SignatoryOption>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem>
            <AccordionHeader $isOpen={openSection === 'school'} onClick={() => setOpenSection(prev => prev === 'school' ? null : 'school')}>
              <h3><Layout size={18} /> Cabeçalho e Conteúdo</h3>
              <ChevronDown size={20} style={{ transform: openSection === 'school' ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </AccordionHeader>
            <AccordionContent $isOpen={openSection === 'school'}>
              <FormGroup>
                <label>Nome da Escola</label>
                <Input name="schoolName" value={formData.schoolName || ''} onChange={handleChange} $primaryColor={primaryColor} />
              </FormGroup>
              <FormGroup>
                <label>Cidade</label>
                <Input name="city" value={formData.city || ''} onChange={handleChange} $primaryColor={primaryColor} />
              </FormGroup>
              <FormGroup>
                <label>Conteúdo (Use {"{data}, {item}, {hora}, {dia_retorno}"})</label>
                <QuillWrapper>
                  <ReactQuill 
                    theme="snow" 
                    value={formData.content || ''} 
                    onChange={(val) => setFormData(prev => ({ ...prev, content: val }))}
                    placeholder="Mensagem..."
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['clean']
                      ]
                    }}
                  />
                </QuillWrapper>
              </FormGroup>

              {(formData.content?.includes('{data}') || formData.content?.includes('{item}') || formData.content?.includes('{hora}') || formData.content?.includes('{dia_retorno}')) && (
                <div style={{ background: '#141414', padding: '15px', borderRadius: '8px', marginTop: '10px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', color: '#666', marginBottom: '10px', fontWeight: 800, textTransform: 'uppercase' }}>Variáveis:</div>
                  <ControlGrid>
                    {formData.content.includes('{data}') && (
                      <FormGroup>
                        <label>Data</label>
                        <Input name="data" value={formData.variables.data || ''} onChange={handleVariableChange} $primaryColor={primaryColor} />
                      </FormGroup>
                    )}
                    {formData.content.includes('{dia_retorno}') && (
                      <FormGroup>
                        <label>Retorno</label>
                        <Input name="dia_retorno" value={formData.variables.dia_retorno || ''} onChange={handleVariableChange} $primaryColor={primaryColor} />
                      </FormGroup>
                    )}
                    {formData.content.includes('{item}') && (
                      <FormGroup>
                        <label>Item</label>
                        <Input name="item" value={formData.variables.item || ''} onChange={handleVariableChange} $primaryColor={primaryColor} />
                      </FormGroup>
                    )}
                    {formData.content.includes('{hora}') && (
                      <FormGroup>
                        <label>Hora</label>
                        <Input name="hora" value={formData.variables.hora || ''} onChange={handleVariableChange} $primaryColor={primaryColor} />
                      </FormGroup>
                    )}
                  </ControlGrid>
                </div>
              )}
              <FormGroup style={{ width: '100%' }}>
                <label>Quantidade Total de Cópias</label>
                <Input type="number" name="copyCount" value={formData.copyCount || ''} onChange={handleChange} $primaryColor={primaryColor} />
              </FormGroup>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem>
            <AccordionHeader $isOpen={openSection === 'signatory'} onClick={() => setOpenSection(prev => prev === 'signatory' ? null : 'signatory')}>
              <h3><User size={18} /> Assinatura</h3>
              <ChevronDown size={20} style={{ transform: openSection === 'signatory' ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </AccordionHeader>
            <AccordionContent $isOpen={openSection === 'signatory'}>
              <OptionGrid>
                {SIGNATORY_OPTIONS.map(s => (
                  <SignatoryOption 
                    key={s} 
                    $active={formData.signatory === s} 
                    $color={primaryColor}
                    onClick={() => setFormData(prev => ({...prev, signatory: s}))}
                  >
                    {getSignatoryLabel(s)}
                  </SignatoryOption>
                ))}
              </OptionGrid>

              {formData.signatory === 'custom' && (
                <FormGroup style={{ marginTop: '20px' }}>
                  <label>Cargo Personalizado</label>
                  <Input 
                    name="customSignatory" 
                    value={formData.customSignatory || ''} 
                    onChange={handleChange} 
                    placeholder="Ex: Secretaria Escolar" 
                    $primaryColor={primaryColor} 
                  />
                </FormGroup>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem>
            <AccordionHeader $isOpen={openSection === 'style'} onClick={() => setOpenSection(prev => prev === 'style' ? null : 'style')}>
              <h3><Palette size={18} /> Estilo e Personalização</h3>
              <ChevronDown size={20} style={{ transform: openSection === 'style' ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </AccordionHeader>
            <AccordionContent $isOpen={openSection === 'style'}>
              <ControlGrid style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
                <FormGroup>
                  <label>Tam. Escola</label>
                  <Input type="number" name="schoolFontSize" value={formData.schoolFontSize || ''} onChange={handleChange} $primaryColor={primaryColor} />
                </FormGroup>
                <FormGroup>
                  <label>Tam. Conteúdo</label>
                  <Input type="number" name="contentFontSize" value={formData.contentFontSize || ''} onChange={handleChange} $primaryColor={primaryColor} />
                </FormGroup>
                <FormGroup>
                  <label>Tam. Assin.</label>
                  <Input type="number" name="signatoryFontSize" value={formData.signatoryFontSize || ''} onChange={handleChange} $primaryColor={primaryColor} />
                </FormGroup>
                <FormGroup>
                  <label>Tam. Logo</label>
                  <Input type="number" name="logoSize" value={formData.logoSize || ''} onChange={handleChange} $primaryColor={primaryColor} />
                </FormGroup>
              </ControlGrid>

              <ControlGrid style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', marginTop: '15px' }}>
                <FormGroup>
                  <label>Altura Linha</label>
                  <Input type="number" step="0.1" name="lineHeight" value={formData.lineHeight || ''} onChange={handleChange} $primaryColor={primaryColor} />
                </FormGroup>
                <FormGroup>
                  <label>Margem Lateral</label>
                  <Input type="number" name="paddingX" value={formData.paddingX || ''} onChange={handleChange} $primaryColor={primaryColor} />
                </FormGroup>
                <FormGroup>
                  <label>Margem Vertical</label>
                  <Input type="number" name="paddingY" value={formData.paddingY || ''} onChange={handleChange} $primaryColor={primaryColor} />
                </FormGroup>
                <FormGroup>
                  <label>Tipo de Fonte</label>
                  <Select name="fontFamily" value={formData.fontFamily || 'Inter'} onChange={handleChange} $primaryColor={primaryColor}>
                    <option value="Inter">Inter</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Arial">Arial</option>
                  </Select>
                </FormGroup>
                <FormGroup>
                  <label>Layout Impressão</label>
                  <Select name="quantity" value={formData.quantity || '4'} onChange={handleChange} $primaryColor={primaryColor}>
                    <option value="2">2 por pág. (Grande)</option>
                    <option value="4">4 por pág. (Econômico)</option>
                  </Select>
                </FormGroup>
              </ControlGrid>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '15px', marginTop: '15px' }}>
                <FormGroup>
                  <label>Cor do Fundo</label>
                  <ColorInput type="color" name="bgColor" value={formData.bgColor || '#ffffff'} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                  <label>Cor do Texto</label>
                  <ColorInput type="color" name="textColor" value={formData.textColor || '#000000'} onChange={handleChange} />
                </FormGroup>
                <FormGroup>
                  <label>Cor Divisor</label>
                  <ColorInput type="color" name="borderColor" value={formData.borderColor || '#eeeeee'} onChange={handleChange} />
                </FormGroup>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '15px' }}>
                <FormGroup>
                  <label>Tít. Alinh.</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <AlignButton $active={formData.titleAlign === 'left'} $color={primaryColor} onClick={() => setFormData(prev => ({...prev, titleAlign: 'left'}))}><AlignLeft size={16} /></AlignButton>
                    <AlignButton $active={formData.titleAlign === 'center'} $color={primaryColor} onClick={() => setFormData(prev => ({...prev, titleAlign: 'center'}))}><AlignCenter size={16} /></AlignButton>
                    <AlignButton $active={formData.titleAlign === 'right'} $color={primaryColor} onClick={() => setFormData(prev => ({...prev, titleAlign: 'right'}))}><AlignRight size={16} /></AlignButton>
                  </div>
                </FormGroup>
                <FormGroup>
                  <label>Txt. Alinh.</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <AlignButton $active={formData.contentAlign === 'left'} $color={primaryColor} onClick={() => setFormData(prev => ({...prev, contentAlign: 'left'}))}><AlignLeft size={16} /></AlignButton>
                    <AlignButton $active={formData.contentAlign === 'center'} $color={primaryColor} onClick={() => setFormData(prev => ({...prev, contentAlign: 'center'}))}><AlignCenter size={16} /></AlignButton>
                    <AlignButton $active={formData.contentAlign === 'right'} $color={primaryColor} onClick={() => setFormData(prev => ({...prev, contentAlign: 'right'}))}><AlignRight size={16} /></AlignButton>
                    <AlignButton $active={formData.contentAlign === 'justify'} $color={primaryColor} onClick={() => setFormData(prev => ({...prev, contentAlign: 'justify'}))}><AlignJustify size={16} /></AlignButton>
                  </div>
                </FormGroup>
                <FormGroup>
                  <label>Ass. Alinh.</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <AlignButton $active={formData.signatureAlign === 'left'} $color={primaryColor} onClick={() => setFormData(prev => ({...prev, signatureAlign: 'left'}))}><AlignLeft size={16} /></AlignButton>
                    <AlignButton $active={formData.signatureAlign === 'center'} $color={primaryColor} onClick={() => setFormData(prev => ({...prev, signatureAlign: 'center'}))}><AlignCenter size={16} /></AlignButton>
                    <AlignButton $active={formData.signatureAlign === 'right'} $color={primaryColor} onClick={() => setFormData(prev => ({...prev, signatureAlign: 'right'}))}><AlignRight size={16} /></AlignButton>
                  </div>
                </FormGroup>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Card>

        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', marginBottom: '15px' }}>
            <Info size={16} />
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Visualização Prévia</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
              <AlignButton $active={formData.isBold} $color={primaryColor} onClick={() => setFormData(prev => ({...prev, isBold: !prev.isBold}))}><Bold size={16} /></AlignButton>
              <AlignButton $active={formData.isItalic} $color={primaryColor} onClick={() => setFormData(prev => ({...prev, isItalic: !prev.isItalic}))}><Italic size={16} /></AlignButton>
            </div>
          </div>
          <PreviewCard style={{ marginTop: 0 }}>
            <BilhetePreview style={{ 
              backgroundColor: formData.bgColor || '#ffffff', 
              color: formData.textColor || '#000000',
              padding: `${formData.paddingY || 20}px ${formData.paddingX || 20}px`,
              fontFamily: formData.fontFamily || 'Inter'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: formData.titleAlign === 'center' ? 'center' : (formData.titleAlign === 'right' ? 'flex-end' : 'flex-start'),
                gap: '15px', 
                borderBottom: `1px solid ${formData.borderColor || '#eeeeee'}`, 
                paddingBottom: '10px', 
                marginBottom: '15px',
                textAlign: formData.titleAlign || 'left',
                flexDirection: formData.titleAlign === 'right' ? 'row-reverse' : 'row'
              }}>
                <img src="/logo-escola.png" alt="Logo" style={{ width: `${formData.logoSize || 40}px`, height: `${formData.logoSize || 40}px`, objectFit: 'contain' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: `${formData.schoolFontSize || 16}px`, textTransform: 'uppercase', lineHeight: 1.1 }}>{formData.schoolName || 'Escola'}</div>
                  <div style={{ fontSize: '10px', color: formData.textColor || '#000000', opacity: 0.7 }}>Comunicado Escolar</div>
                </div>
              </div>
              
              <div style={{ 
                minHeight: '80px', 
                fontSize: `${formData.contentFontSize || 12}px`, 
                textAlign: formData.contentAlign || 'justify',
                lineHeight: formData.lineHeight || 1.5, 
                marginBottom: '20px',
                fontWeight: formData.isBold ? 'bold' : 'normal',
                fontStyle: formData.isItalic ? 'italic' : 'normal',
                overflowWrap: 'break-word',
                wordBreak: 'normal'
              }}>
                <div dangerouslySetInnerHTML={{ __html: replaceVariables(formData.content) || 'Conteúdo do bilhete...' }} />
              </div>

              <div style={{ 
                textAlign: (formData.signatureAlign === 'justify' || formData.signatureAlign === 'right') ? 'right' : (formData.signatureAlign === 'center' ? 'center' : 'left'), 
                fontSize: '11px', 
                marginBottom: '10px',
                opacity: 0.8
              }}>
                {formData.city || 'Cidade'}, {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.
              </div>

              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: formData.signatureAlign === 'left' ? 'flex-start' : (formData.signatureAlign === 'right' ? 'flex-end' : 'center') 
              }}>
                <div style={{ width: '150px', borderTop: `1px solid ${formData.textColor || '#000000'}`, marginBottom: '4px', opacity: 0.5 }} />
                <div style={{ fontWeight: 700, fontSize: `${formData.signatoryFontSize || 11}px`, textTransform: 'uppercase' }}>
                  {formData.signatory === 'custom' ? (formData.customSignatory || 'Assinatura') : (formData.signatory || 'Direção')}
                </div>
              </div>
            </BilhetePreview>
          </PreviewCard>
        </div>
      </MainGrid>

      {/* Optimized Print Container */}
      <div style={{ display: 'none' }}>
        <BilhetePrint ref={componentRef} data={{...formData, content: replaceVariables(formData.content)}} />
      </div>
    </PageContainer>
  );
};

export default BilheteGeneratorPanel;
