import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Tag, Printer, Hash, Type, Plus, Info, Layout, ChevronDown, Palette, ChevronUp } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';
import schoolLogo from '../assets/logo-escola.png';
import LabelPrint from '../components/LabelPrint';

const PageContainer = styled.div`
  padding: 20px;
  animation: fadeIn 0.5s ease-out;
  max-width: 1400px;
  margin: 0 auto;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const MainGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 900px;
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
    
    @media (max-width: 600px) {
      font-size: 22px;
    }
  }
  
  p {
    color: #888;
    font-size: 14px;
    margin-top: 4px;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 600px) {
    width: 100%;
    
    button {
      flex: 1;
    }
  }
`;

const Card = styled.div`
  background: #141414;
  border: 1px solid #262626;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  @media (max-width: 600px) {
    padding: 16px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: #888;
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

  &:hover {
    background: ${props => props.$primary ? (props.$color || 'white') : '#252525'};
    color: white;
    transform: translateY(-1px);
    box-shadow: ${props => props.$primary ? `0 4px 12px ${props.$color}44` : 'none'};
  }

  &:active {
    transform: translateY(0);
  }
`;

const PreviewCard = styled.div`
  margin-top: 30px;
  background: #0a0a0a;
  border: 1px dashed #333;
  border-radius: 12px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  overflow-x: auto;
  
  @media (max-width: 600px) {
    padding: 20px;
  }
`;

const LabelPreview = styled.div`
  background: white;
  border-radius: 4px;
  display: flex;
  flex-direction: ${props => props.$imagePosition === 'top' ? 'column' : (props.$imagePosition === 'right' ? 'row-reverse' : 'row')};
  align-items: center;
  padding: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  color: black;
  overflow: hidden;
  transition: all 0.3s ease;
`;

const AccordionItem = styled.div`
  border-bottom: 1px solid #262626;
  &:last-child { border-bottom: none; }
`;

const AccordionHeader = styled.div`
  padding: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: ${props => props.$isOpen ? '#1a1a1a' : 'transparent'};
  transition: background 0.2s;
  
  &:hover { background: #1a1a1a; }
  
  h3 {
    font-size: 14px;
    font-weight: 700;
    color: ${props => props.$isOpen ? 'white' : '#888'};
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 10px;
  }
`;

const AccordionContent = styled.div`
  padding: ${props => props.$isOpen ? '20px' : '0'};
  max-height: ${props => props.$isOpen ? '1000px' : '0'};
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #0d0d0d;
`;

const OptionPill = styled.button`
  background: ${props => props.$active ? (props.$color + '22') : '#111'};
  border: 1px solid ${props => props.$active ? props.$color : '#222'};
  color: ${props => props.$active ? 'white' : '#666'};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.$color};
    color: white;
  }
`;

const IconOption = styled.button`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$active ? (props.$color + '22') : '#111'};
  border: 1px solid ${props => props.$active ? props.$color : '#222'};
  color: ${props => props.$active ? 'white' : '#666'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
`;

const LabelGeneratorPanel = () => {
  const { settings } = useSettings();
  const primaryColor = settings.primaryColor;
  const componentRef = useRef();

  const [formData, setFormData] = useState({
    size: '9x3',
    customWidth: 90,
    customHeight: 30,
    type: 'prefix',
    description: 'CHROMEBOOK',
    text: '',
    prefix: 'EMSLC-',
    quantity: '10',
    startNumber: '1',
    imagePosition: 'left',
    logo: '/src/assets/logo-escola.png'
  });

  const [openSection, setOpenSection] = useState('dimensions');

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Etiquetas - ${formData.type === 'prefix' ? formData.description : formData.text}`,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onPrintClick = () => {
    if (formData.type === 'prefix') {
      if (!formData.description) {
        toast.error("Informe a descrição da etiqueta.");
        return;
      }
      if (!formData.quantity || parseInt(formData.quantity) <= 0) {
        toast.error("Informe uma quantidade válida.");
        return;
      }
    } else {
      if (!formData.text) {
        toast.error("Informe o texto da etiqueta.");
        return;
      }
    }
    
    handlePrint();
  };

  const previewID = formData.type === 'prefix' 
    ? `${formData.prefix}${(parseInt(formData.startNumber) || 1).toString().padStart(3, '0')}`
    : formData.text;

  const currentWidth = formData.size === 'custom' ? formData.customWidth : parseInt(formData.size.split('x')[0]) * 10;
  const currentHeight = formData.size === 'custom' ? formData.customHeight : parseInt(formData.size.split('x')[1]) * 10;

  // Scale for preview (multiplier to look good on screen)
  const scale = 4;

  return (
    <PageContainer>
      <Header>
        <TitleGroup>
          <h1>Gerador de Etiquetas v2</h1>
          <p>Personalize dimensões e design das suas etiquetas.</p>
        </TitleGroup>
        <ActionGroup>
          <Button $primary $color={primaryColor} onClick={onPrintClick}>
            <Printer size={18} /> Imprimir Etiquetas
          </Button>
        </ActionGroup>
      </Header>

      <MainGrid>
        <Card style={{ padding: 0 }}>
          <AccordionItem>
            <AccordionHeader $isOpen={openSection === 'dimensions'} onClick={() => setOpenSection(openSection === 'dimensions' ? null : 'dimensions')}>
              <h3><Layout size={18} /> Dimensões</h3>
              <ChevronDown size={20} style={{ transform: openSection === 'dimensions' ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </AccordionHeader>
            <AccordionContent $isOpen={openSection === 'dimensions'}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <OptionPill $active={formData.size === '9x3'} $color={primaryColor} onClick={() => setFormData({...formData, size: '9x3'})}>9 x 3 cm</OptionPill>
                <OptionPill $active={formData.size === '5x2.5'} $color={primaryColor} onClick={() => setFormData({...formData, size: '5x2.5'})}>5 x 2,5 cm</OptionPill>
                <OptionPill $active={formData.size === 'custom'} $color={primaryColor} onClick={() => setFormData({...formData, size: 'custom'})}>Personalizado</OptionPill>
              </div>
              
              {formData.size === 'custom' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <FormGroup>
                    <label>Largura (mm)</label>
                    <Input type="number" name="customWidth" value={formData.customWidth} onChange={handleChange} $primaryColor={primaryColor} />
                  </FormGroup>
                  <FormGroup>
                    <label>Altura (mm)</label>
                    <Input type="number" name="customHeight" value={formData.customHeight} onChange={handleChange} $primaryColor={primaryColor} />
                  </FormGroup>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem>
            <AccordionHeader $isOpen={openSection === 'content'} onClick={() => setOpenSection(openSection === 'content' ? null : 'content')}>
              <h3><Type size={18} /> Conteúdo</h3>
              <ChevronDown size={20} style={{ transform: openSection === 'content' ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </AccordionHeader>
            <AccordionContent $isOpen={openSection === 'content'}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <OptionPill $active={formData.type === 'prefix'} $color={primaryColor} onClick={() => setFormData({...formData, type: 'prefix'})}>Patrimônio</OptionPill>
                <OptionPill $active={formData.type === 'text'} $color={primaryColor} onClick={() => setFormData({...formData, type: 'text'})}>Texto Fixo</OptionPill>
              </div>

              {formData.type === 'prefix' ? (
                <div style={{ display: 'grid', gap: '15px' }}>
                  <FormGroup>
                    <label>Descrição</label>
                    <Input name="description" value={formData.description} onChange={handleChange} placeholder="Ex: CHROMEBOOK" $primaryColor={primaryColor} />
                  </FormGroup>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <FormGroup>
                      <label>Prefixo</label>
                      <Input name="prefix" value={formData.prefix} onChange={handleChange} placeholder="Ex: EMSLC-" $primaryColor={primaryColor} />
                    </FormGroup>
                    <FormGroup>
                      <label>Quantidade</label>
                      <Input type="number" name="quantity" value={formData.quantity} onChange={handleChange} $primaryColor={primaryColor} />
                    </FormGroup>
                  </div>
                  <FormGroup>
                    <label>Iniciar em</label>
                    <Input type="number" name="startNumber" value={formData.startNumber} onChange={handleChange} $primaryColor={primaryColor} />
                  </FormGroup>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  <FormGroup>
                    <label>Texto da Etiqueta</label>
                    <Input name="text" value={formData.text} onChange={handleChange} placeholder="Digite o texto personalizado" $primaryColor={primaryColor} />
                  </FormGroup>
                  <FormGroup>
                    <label>Quantidade</label>
                    <Input type="number" name="quantity" value={formData.quantity} onChange={handleChange} $primaryColor={primaryColor} />
                  </FormGroup>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem>
            <AccordionHeader $isOpen={openSection === 'design'} onClick={() => setOpenSection(openSection === 'design' ? null : 'design')}>
              <h3><Palette size={18} /> Design</h3>
              <ChevronDown size={20} style={{ transform: openSection === 'design' ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </AccordionHeader>
            <AccordionContent $isOpen={openSection === 'design'}>
              <FormGroup>
                <label>Posição do Logo</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <IconOption title="Esquerda" $active={formData.imagePosition === 'left'} $color={primaryColor} onClick={() => setFormData({...formData, imagePosition: 'left'})}>
                    <div style={{ width: '12px', height: '12px', background: 'currentColor', borderRadius: '2px', marginRight: '4px' }} />
                    <div style={{ width: '4px', height: '4px', background: 'currentColor', opacity: 0.3 }} />
                  </IconOption>
                  <IconOption title="Direita" $active={formData.imagePosition === 'right'} $color={primaryColor} onClick={() => setFormData({...formData, imagePosition: 'right'})}>
                    <div style={{ width: '4px', height: '4px', background: 'currentColor', opacity: 0.3, marginRight: '4px' }} />
                    <div style={{ width: '12px', height: '12px', background: 'currentColor', borderRadius: '2px' }} />
                  </IconOption>
                  <IconOption title="Topo" $active={formData.imagePosition === 'top'} $color={primaryColor} onClick={() => setFormData({...formData, imagePosition: 'top'})}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                      <div style={{ width: '12px', height: '12px', background: 'currentColor', borderRadius: '2px' }} />
                      <div style={{ width: '4px', height: '4px', background: 'currentColor', opacity: 0.3 }} />
                    </div>
                  </IconOption>
                  <IconOption title="Sem Logo" $active={formData.imagePosition === 'none'} $color={primaryColor} onClick={() => setFormData({...formData, imagePosition: 'none'})}>
                    <Hash size={18} />
                  </IconOption>
                </div>
              </FormGroup>
            </AccordionContent>
          </AccordionItem>
        </Card>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', marginBottom: '15px' }}>
            <Info size={16} />
            <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Visualização em Tempo Real</span>
          </div>

          <PreviewCard style={{ padding: '60px' }}>
            <LabelPreview 
              $imagePosition={formData.imagePosition}
              style={{ 
                width: `${currentWidth * scale}px`, 
                height: `${currentHeight * scale}px`,
                justifyContent: formData.imagePosition === 'none' ? 'center' : 'flex-start'
              }}
            >
              {formData.imagePosition !== 'none' && (
                <div style={{ 
                  width: formData.imagePosition === 'top' ? '100%' : '35%', 
                  height: formData.imagePosition === 'top' ? '40%' : '100%',
                  borderRight: formData.imagePosition === 'left' ? '1px solid #eee' : 'none',
                  borderLeft: formData.imagePosition === 'right' ? '1px solid #eee' : 'none',
                  borderBottom: formData.imagePosition === 'top' ? '1px solid #eee' : 'none',
                  padding: '5px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <img src={schoolLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              )}
              <div style={{ 
                flex: 1, 
                textAlign: 'center', 
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                {formData.type === 'prefix' && (
                  <div style={{ fontSize: `${16 * (currentHeight / 30)}px`, fontWeight: 800, textTransform: 'uppercase' }}>{formData.description || 'DESCRIÇÃO'}</div>
                )}
                <div style={{ 
                  fontSize: `${(formData.type === 'text' ? 22 : 24) * (currentHeight / 30)}px`, 
                  fontWeight: 900, 
                  letterSpacing: '1px',
                  lineHeight: 1.1,
                  wordBreak: 'break-word'
                }}>
                  {previewID || 'CONTEÚDO'}
                </div>
              </div>
            </LabelPreview>
            <p style={{ color: '#555', fontSize: '12px', marginTop: '20px' }}>
              Tamanho final no papel: {currentWidth/10}cm x {currentHeight/10}cm
            </p>
          </PreviewCard>
        </div>
      </MainGrid>

      <LabelPrint ref={componentRef} data={formData} />
    </PageContainer>
  );
};

export default LabelGeneratorPanel;
