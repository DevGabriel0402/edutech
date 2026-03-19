import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styled from 'styled-components';
import {
  Mail, Printer, Layout, Type, Edit2, Save, ChevronDown,
  User, Info, PlusCircle, Palette, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, Share2, Clipboard, Database, Calendar,
  Bold, Italic, Maximize, Move, CheckCircle as CheckIcon
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import BilhetePrint from '../components/BilhetePrint';
import schoolLogo from '../assets/logo-escola.png';

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

const TextArea = styled.textarea`
  background: #0f0f0f;
  border: 1px solid #262626;
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  font-size: 15px;
  min-height: 200px;
  width: 100%;
  resize: vertical;
  font-family: 'Inter', sans-serif;
  line-height: 1.5;
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

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-top: 10px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: ${props => props.$active ? (props.$color + '14') : '#0f0f0f'};
  border: 1px solid ${props => props.$active ? props.$color : '#262626'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  color: ${props => props.$active ? 'white' : '#888'};
  font-weight: 600;

  &:hover {
    border-color: ${props => props.$color};
    background: ${props => props.$active ? (props.$color + '1a') : '#141414'};
  }

  input {
    display: none;
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
  'Secretaria Escolar',
  'Coordenação Geral',
  'Coordenação da Integrada',
  'custom'
];

const PRESET_TEMPLATES = [
  {
    id: 'parque',
    name: 'Parque das Mangabeiras',
    text: 'Autorização de atividades no Parque das Mangabeiras\n\nAutorizo o (a) aluno (a) ________________________________________ a participar das atividades que ocorrerem no Parque das Mangabeiras, com pessoas responsáveis pela Escola Municipal Senador Levindo Coelho, durante o ano de {ano}. Estou ciente que essas atividades poderão ocorrer semanalmente, sem outro tipo de aviso prévio, e fará parte do processo educativo.',
    icon: <Maximize size={16} />,
    overrides: { showAuthorizationText: false }
  },
  {
    id: 'matriculas',
    name: 'Sobre Matrículas',
    text: 'INFORMAÇÕES SOBRE MATRÍCULA\n\nSenhores pais e ou responsáveis,\n\nInformações de final do ano:\n• {ano_atual}º ano: alunos sorteados para permanecer na escola e alunos retidos, devem renovar a matrícula imediatamente.\nAlunos sorteados para a E.E. Professor Pedro Aleixo deverão pegar a transferência após o dia {data_transferencia}.\n• A matricula nas escolas do Estado deverão ser realizadas no período de {periodo_estado}.',
    icon: <Clipboard size={16} />
  },
  {
    id: 'extra_classe',
    name: 'Atividade Extra-classe',
    text: 'AUTORIZAÇÃO PARA ATIVIDADE EXTRA-CLASSE\n\nSrs. Pais ou Responsáveis,\n\nNo dia {data}, {dia_semana}, os alunos da {turma} irão participar de uma atividade na {local}. Nesse dia os alunos deverão vir à escola no horário NORMAL, UNIFORMIZADOS. NÃO PRECISA TRAZER LANCHE. Deverão trazer o material do 1º horário, uma roupa para troca e uma toalha. Para maior organização da atividade e segurança dos alunos, somente os que trouxerem esta autorização assinada pelos pais/responsáveis poderão participar da atividade.\n\n• Data da excursão: {data}, {dia_semana};\n• Saída: {hora_saida}\n• Chegada: {hora_chegada}\n\nAutorizo o (a) aluno (a) ________________________________________ a participar da atividade.\n\n________________________________________________\nAssinatura Pai, Mãe ou Responsável.',
    icon: <PlusCircle size={16} />,
    overrides: { showAuthorizationText: false }
  },
  {
    id: 'assembleia',
    name: 'Assembleia',
    text: 'CONVOCAÇÃO\n\nSrs. Pais ou Responsáveis,\n\nNo dia {data}, {dia_semana}, teremos a ASSEMBLEIA ESCOLAR, às {hora}, na quadra da escola.\nNesse dia os alunos não terão aula. Voltaremos com as aulas na {dia_retorno}, {data_retorno}, nos horários normais.\n\nPauta:\n□ {pauta_1};\n□ {pauta_2}.\n\nAtenciosamente,\nDireção e Coordenação',
    icon: <AlignJustify size={16} />
  },
  {
    id: 'extra_classe_projeto',
    name: 'Extra Classe (Projeto)',
    text: 'AUTORIZAÇÃO PARA ATIVIDADE EXTRA-CLASSE\n\nSrs. Pais ou Responsáveis,\n\nNo dia {data}, {dia_semana}, os participantes do {projeto} irão participar de uma atividade no {local_detalhado}. Nesse dia os alunos deverão vir à escola no horário NORMAL, UNIFORMIZADOS. NÃO PRECISA TRAZER LANCHE. Para maior organização da atividade e segurança dos alunos, somente os que trouxerem esta autorização assinada pelos pais/responsáveis poderão participar da atividade.\n\n• Data da excursão: {data}, {dia_semana};\n• Saída: {hora_saida} horas\n• Chegada: {hora_chegada}\n\nAutorizo o (a) aluno (a) {aluno} a participar da atividade.',
    icon: <Move size={16} />,
    overrides: { showAuthorizationText: false }
  },
  {
    id: 'paralisacao',
    name: 'Comunicado Paralisação',
    text: 'COMUNICADO\n\nSrs. Pais ou Responsáveis,\n\nComunicamos que no dia {data_paralisacao}, {dia_semana_paralisacao}, não haverá aula para as salas {salas_paralisacao} do turno da {turno_paralisacao}, por motivo de paralisação. Estas turmas voltarão às aulas no dia {data_retorno_paralisacao}, nos horários normais.\n\nAtenciosamente,',
    icon: <Info size={16} />
  },
  {
    id: 'faltas',
    name: 'Quantidade de Faltas',
    text: 'COMUNICADO\n\nSrs. Pais ou Responsáveis,\n\nComunicamos que o aluno {aluno} apresenta até o momento {quantidade_faltas} dias de faltas. Informamos que este número pode levar a uma retenção neste ano.\n\nPedimos que fiquem atentos a frequência escolar e que compareçam à escola para conversarmos.',
    icon: <Clipboard size={16} />
  },
  {
    id: 'cinema_shopping',
    name: 'Cinema / Shopping',
    text: 'AUTORIZAÇÃO PARA ATIVIDADE EXTRA-CLASSE\n\nSrs. Pais ou Responsáveis,\n\nNo dia {data}, {dia_semana}, os alunos das salas {salas_cinema_shopping}, irão participar de uma atividade no {local_cinema_shopping}. Nesse dia, os alunos deverão comparecer à escola no horário normal de aula, uniformizados. Para maior organização da atividade e segurança dos alunos, somente os que trouxerem esta autorização assinada pelos pais/responsáveis poderão participar da atividade.\n\nAutorizo o (a) aluno (a) {aluno} a participar da atividade.',
    icon: <Maximize size={16} />,
    overrides: { showAuthorizationText: false }
  },
  {
    id: 'entrega_resultados',
    name: 'Entrega de Resultados',
    text: 'CONVOCAÇÃO DE PAIS – ENTREGA DE RESULTADOS DO {trimestre} TRIMESTRE {ano}\n\nSrs. Pais ou Responsáveis,\n\nNo dia {data_reuniao}, {dia_semana_reuniao}, realizaremos uma reunião para entrega de resultados dos alunos dos {anos_escolares}.\nRessaltamos que o acompanhamento dos pais na vida escolar dos filhos é fator primordial que favorece a aprendizagem e o desenvolvimento dos estudantes.\n\n• Data da reunião: {data_reuniao} {dia_semana_reuniao};\n• Horário: de {hora_reuniao} horas\n-------------------------------------------------------------------------------------------------------------------------------------\nEu, {responsavel} responsável pelo (a) aluno (a) {aluno}, da sala____ recebi a convocação para a reunião de entrega de resultados no dia {data_reuniao}.',
    icon: <User size={16} />,
    overrides: { showAuthorizationText: false }
  },
  {
    id: 'declaracao',
    name: 'Declaração de Comparecimento',
    text: 'DECLARAÇÃO DE COMPARECIMENTO\n\nDeclaramos para os devidos fins que o(a) Sr(a). {responsavel}, responsável pelo(a) aluno(a) {aluno}, compareceu a esta instituição de ensino no dia {data}, no período de {hora_inicio} às {hora_fim}, para tratar de assuntos de interesse de seu(sua) filho(a).\n\n{cidade}, {data_completa}.\n\n________________________________________________\nSecretaria Escolar / Direção',
    icon: <Clipboard size={16} />,
    overrides: {
      showWatermark: true,
      watermarkSize: 300,
      showAuthorizationText: false,
      showSignatureLine: false,
      showDate: false,
      qtyPerPage: '1',
      fullPageCentering: true,
      variables: {
        data: '',
        hora_inicio: '',
        hora_fim: ''
      }
    }
  },
  {
    id: 'reposicao',
    name: 'Reposição de Aula',
    text: 'COMUNICADO\n\nSrs. Pais ou Responsáveis,\n\nComunicamos que no dia {data_1}, {dia_semana_1}, haverá aula de reposição de greve, para as salas {salas_1} do turno da {turno_1}, no horário {hora_inicio_1} às {hora_fim_1}.\n\nNo {dia_semana_2}, dia {data_2}, haverá aula de reposição de greve, para as salas {salas_2} do turno da {turno_2}, no horário {hora_inicio_2} às {hora_fim_2}.\n\nAtenciosamente,\nCoordenação e Direção',
    icon: <Edit2 size={16} />
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
    logoSize: 35,
    lineHeight: 1.4,
    paddingX: 10,
    paddingY: 2,
    bgColor: '#ffffff',
    textColor: '#000000',
    borderColor: '#eeeeee',
    fontFamily: 'Inter',
    isBold: false,
    isItalic: false,
    showSignatureLine: true,
    showAuthorizationText: false,
    showDate: true,
    showLogoHeader: true,
    showWatermark: false,
    watermarkSize: 300,
    fullPageCentering: false,
    variables: {
      data: '',
      data_completa: format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
      cidade: 'Belo Horizonte',
      responsavel: '',
      aluno: '',
      hora_inicio: '',
      hora_fim: '',
      dia_retorno: '',
      item: '',
      hora: '',
      dia_semana: '',
      turma: '',
      local: '',
      professor: '',
      ano: format(new Date(), 'yyyy'),
      ano_atual: '6',
      data_transferencia: '26/12',
      periodo_estado: '16 a 20 de janeiro',
      hora_saida: '',
      hora_chegada: '',
      data_retorno: '',
      pauta_1: 'Programa Escola Integrada',
      pauta_2: 'Clime escolar',
      data_1: '',
      dia_semana_1: '',
      salas_1: '',
      turno_1: 'TARDE',
      hora_inicio_1: '13:00',
      hora_fim_1: '17:20',
      data_2: '',
      dia_semana_2: 'SÁBADO',
      salas_2: '',
      turno_2: 'TARDE',
      hora_inicio_2: '10:00',
      hora_fim_2: '14:20',
      projeto: 'Projeto Ler o Mundo',
      local_detalhado: 'Setor Braille da Biblioteca Pública Estadual Luiz de Bessa',
      data_paralisacao: '11/11',
      dia_semana_paralisacao: 'SEXTA-FEIRA',
      salas_paralisacao: '01, 02, 04, 08, 10 e 12',
      turno_paralisacao: 'MANHÃ',
      data_retorno_paralisacao: '16/11/2016',
      quantidade_faltas: '',
      salas_cinema_shopping: '01 e 02',
      local_cinema_shopping: 'Shopping Boulevard',
      trimestre: '1º',
      data_reuniao: '03/06/2017',
      dia_semana_reuniao: 'SÁBADO',
      anos_escolares: '6ºs anos e do 3º ciclo',
      hora_reuniao: '08'
    }
  });

  const [openSection, setOpenSection] = useState('templates');

  const replaceVariables = (text) => {
    if (!text) return '';

    // First, strip HTML tags if they exist (legacy content)
    let cleanedText = text.replace(/<[^>]*>/g, '');

    // Resolve common HTML entities
    cleanedText = cleanedText
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    let newText = cleanedText;
    Object.keys(formData.variables).forEach(key => {
      let displayValue = formData.variables[key];

      // Fallback for empty values
      if (displayValue === undefined || displayValue === null || displayValue === '') {
        if (key === 'aluno' || key === 'responsavel') {
          displayValue = '________________________________________';
        } else if (key === 'data' || key === 'hora' || key.startsWith('data_') || key.startsWith('hora_')) {
          displayValue = '_____________'; // Matches user's literal request
        } else {
          displayValue = '____________________';
        }
      } else if (key === 'aluno' || key === 'responsavel') {
        // Uppercase for names
        displayValue = displayValue.toUpperCase();
      }

      const regex = new RegExp(`{${key}}`, 'g');
      newText = newText.replace(regex, displayValue);
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
    setFormData(prev => {
      const { variables, ...otherOverrides } = template.overrides || {};
      return {
        ...prev,
        content: template.text,
        ...otherOverrides,
        variables: {
          ...prev.variables,
          ...(variables || {})
        }
      };
    });
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
          let content = savedData.content || '';

          // Auto-cleanup HTML if detected in saved content (legacy transition)
          if (content.includes('<') && content.includes('>')) {
            content = content
              .replace(/<br\s*\/?>/gi, '\n') // Convert BR to newline
              .replace(/<\/p>/gi, '\n')     // Convert closing P to newline
              .replace(/<[^>]*>/g, '')      // Strip all other tags
              .replace(/&nbsp;/g, ' ')      // Resolve nbsp
              .trim();
          }

          setFormData(prev => ({
            ...prev,
            ...savedData,
            content,
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
                <label><Edit2 size={16} /> Conteúdo do Bilhete</label>
                <TextArea
                  name="content"
                  value={formData.content || ''}
                  onChange={handleChange}
                  placeholder="Digite o comunicado..."
                  $primaryColor={primaryColor}
                />
              </FormGroup>

              {(() => {
                const variableMatches = formData.content?.match(/{([^{}]+)}/g) || [];
                const uniqueVariables = [...new Set(variableMatches.map(m => m.replace(/[{}]/g, '')))];

                if (uniqueVariables.length === 0) return null;

                return (
                  <div style={{ background: '#141414', padding: '15px', borderRadius: '8px', marginTop: '10px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '10px', fontWeight: 800, textTransform: 'uppercase' }}>Variáveis Detectadas:</div>
                    <ControlGrid>
                      {uniqueVariables.map(variable => (
                        <FormGroup key={variable}>
                          <label style={{ textTransform: 'capitalize' }}>{variable.replace('_', ' ')}</label>
                          <Input
                            name={variable}
                            value={formData.variables[variable] || ''}
                            onChange={handleVariableChange}
                            $primaryColor={primaryColor}
                            placeholder={`Valor para {${variable}}`}
                          />
                        </FormGroup>
                      ))}
                    </ControlGrid>
                  </div>
                );
              })()}
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
                    onClick={() => setFormData(prev => ({ ...prev, signatory: s }))}
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
                    <AlignButton $active={formData.titleAlign === 'left'} $color={primaryColor} onClick={() => setFormData(prev => ({ ...prev, titleAlign: 'left' }))}><AlignLeft size={16} /></AlignButton>
                    <AlignButton $active={formData.titleAlign === 'center'} $color={primaryColor} onClick={() => setFormData(prev => ({ ...prev, titleAlign: 'center' }))}><AlignCenter size={16} /></AlignButton>
                    <AlignButton $active={formData.titleAlign === 'right'} $color={primaryColor} onClick={() => setFormData(prev => ({ ...prev, titleAlign: 'right' }))}><AlignRight size={16} /></AlignButton>
                  </div>
                </FormGroup>
                <FormGroup>
                  <label>Txt. Alinh.</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <AlignButton $active={formData.contentAlign === 'left'} $color={primaryColor} onClick={() => setFormData(prev => ({ ...prev, contentAlign: 'left' }))}><AlignLeft size={16} /></AlignButton>
                    <AlignButton $active={formData.contentAlign === 'center'} $color={primaryColor} onClick={() => setFormData(prev => ({ ...prev, contentAlign: 'center' }))}><AlignCenter size={16} /></AlignButton>
                    <AlignButton $active={formData.contentAlign === 'right'} $color={primaryColor} onClick={() => setFormData(prev => ({ ...prev, contentAlign: 'right' }))}><AlignRight size={16} /></AlignButton>
                    <AlignButton $active={formData.contentAlign === 'justify'} $color={primaryColor} onClick={() => setFormData(prev => ({ ...prev, contentAlign: 'justify' }))}><AlignJustify size={16} /></AlignButton>
                  </div>
                </FormGroup>
                <FormGroup>
                  <label>Ass. Alinh.</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <AlignButton $active={formData.signatureAlign === 'left'} $color={primaryColor} onClick={() => setFormData(prev => ({ ...prev, signatureAlign: 'left' }))}><AlignLeft size={16} /></AlignButton>
                    <AlignButton $active={formData.signatureAlign === 'center'} $color={primaryColor} onClick={() => setFormData(prev => ({ ...prev, signatureAlign: 'center' }))}><AlignCenter size={16} /></AlignButton>
                    <AlignButton $active={formData.signatureAlign === 'right'} $color={primaryColor} onClick={() => setFormData(prev => ({ ...prev, signatureAlign: 'right' }))}><AlignRight size={16} /></AlignButton>
                  </div>
                </FormGroup>
              </div>

              <div style={{ marginTop: '20px' }}>
                <label style={{ fontSize: '11px', color: '#666', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px', display: 'block' }}>Opções de Visibilidade</label>
                <CheckboxGroup>
                  <CheckboxItem $active={formData.showLogoHeader} $color={primaryColor}>
                    <input type="checkbox" checked={formData.showLogoHeader} onChange={() => setFormData(p => ({ ...p, showLogoHeader: !p.showLogoHeader }))} />
                    {formData.showLogoHeader ? <CheckIcon size={14} /> : <PlusCircle size={14} />}
                    Exibir Logo
                  </CheckboxItem>
                  <CheckboxItem $active={formData.showSignatureLine} $color={primaryColor}>
                    <input type="checkbox" checked={formData.showSignatureLine} onChange={() => setFormData(p => ({ ...p, showSignatureLine: !p.showSignatureLine }))} />
                    {formData.showSignatureLine ? <CheckIcon size={14} /> : <PlusCircle size={14} />}
                    Linha Assinatura
                  </CheckboxItem>
                  <CheckboxItem $active={formData.showDate} $color={primaryColor}>
                    <input type="checkbox" checked={formData.showDate} onChange={() => setFormData(p => ({ ...p, showDate: !p.showDate }))} />
                    {formData.showDate ? <CheckIcon size={14} /> : <PlusCircle size={14} />}
                    Exibir Data
                  </CheckboxItem>
                  <CheckboxItem $active={formData.showAuthorizationText} $color={primaryColor}>
                    <input type="checkbox" checked={formData.showAuthorizationText} onChange={() => setFormData(p => ({ ...p, showAuthorizationText: !p.showAuthorizationText }))} />
                    {formData.showAuthorizationText ? <CheckIcon size={14} /> : <PlusCircle size={14} />}
                    Autorização Básica
                  </CheckboxItem>
                  <CheckboxItem $active={formData.showWatermark} $color={primaryColor}>
                    <input type="checkbox" checked={formData.showWatermark} onChange={() => setFormData(p => ({ ...p, showWatermark: !p.showWatermark }))} />
                    {formData.showWatermark ? <CheckIcon size={14} /> : <PlusCircle size={14} />}
                    Marca d'água
                  </CheckboxItem>
                </CheckboxGroup>
              </div>

              {formData.showWatermark && (
                <FormGroup style={{ marginTop: '20px' }}>
                  <label>Tamanho da Marca d'água: {formData.watermarkSize}px</label>
                  <input
                    type="range"
                    min="100"
                    max="500"
                    name="watermarkSize"
                    value={formData.watermarkSize}
                    onChange={handleChange}
                    style={{ width: '100%', accentColor: primaryColor }}
                  />
                </FormGroup>
              )}
            </AccordionContent>
          </AccordionItem>
        </Card>

        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', marginBottom: '15px' }}>
            <Info size={16} />
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase' }}>Visualização Prévia</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
              <AlignButton $active={formData.isBold} $color={primaryColor} onClick={() => setFormData(prev => ({ ...prev, isBold: !prev.isBold }))}><Bold size={16} /></AlignButton>
              <AlignButton $active={formData.isItalic} $color={primaryColor} onClick={() => setFormData(prev => ({ ...prev, isItalic: !prev.isItalic }))}><Italic size={16} /></AlignButton>
            </div>
          </div>
          <PreviewCard style={{ marginTop: 0 }}>
            <BilhetePreview style={{
              backgroundColor: formData.bgColor || '#ffffff',
              color: formData.textColor || '#000000',
              padding: `${formData.paddingY ?? 2}px ${formData.paddingX ?? 10}px`,
              fontFamily: formData.fontFamily || 'Inter',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: (formData.qtyPerPage === '1' && formData.fullPageCentering) ? 'center' : 'flex-start',
              minHeight: '400px'
            }}>
              {formData.showWatermark && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: `${formData.watermarkSize}px`,
                  opacity: 0.1,
                  pointerEvents: 'none',
                  zIndex: 0
                }}>
                  <img src={schoolLogo} alt="Watermark" style={{ width: '100%', height: 'auto' }} />
                </div>
              )}
              {formData.showLogoHeader && (
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
                  <img src={schoolLogo} alt="Logo" style={{ width: `${formData.logoSize || 40}px`, height: `${formData.logoSize || 40}px`, objectFit: 'contain' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: `${formData.schoolFontSize || 16}px`, textTransform: 'uppercase', lineHeight: 1.1 }}>{formData.schoolName || 'Escola'}</div>
                    <div style={{ fontSize: '10px', color: formData.textColor || '#000000', opacity: 0.7 }}>Comunicado Escolar</div>
                  </div>
                </div>
              )}

              <div
                style={{
                  minHeight: '80px',
                  fontSize: `${formData.contentFontSize || 12}px`,
                  textAlign: formData.contentAlign || 'justify',
                  textJustify: 'inter-word',
                  lineHeight: formData.lineHeight || 1.5,
                  marginBottom: '20px',
                  fontWeight: formData.isBold ? 'bold' : 'normal',
                  fontStyle: formData.isItalic ? 'italic' : 'normal',
                  overflowWrap: 'break-word',
                  wordBreak: 'normal',
                  hyphens: 'none',
                  display: 'block',
                  width: '100%',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {replaceVariables(formData.content) || 'Conteúdo do bilhete...'}
              </div>

              {formData.showAuthorizationText && (
                <div style={{
                  marginTop: '15px',
                  fontSize: `${formData.contentFontSize || 12}px`,
                  marginBottom: '15px'
                }}>
                  <div style={{ marginBottom: '15px' }}>
                    Autorizo o (a) aluno (a) {(formData.variables.aluno || '____________________').toUpperCase()}, da turma {(formData.variables.turma || '___________').toUpperCase()} a participar da atividade acima referida.
                  </div>
                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <div style={{ width: '250px', borderTop: '1px solid black', margin: '0 auto 5px' }} />
                    <div style={{ fontSize: `${(formData.contentFontSize || 12) * 0.9}px` }}>Assinatura dos pais ou responsável</div>
                  </div>
                </div>
              )}

              {formData.showDate && (
                <div style={{
                  textAlign: (formData.signatureAlign === 'justify' || formData.signatureAlign === 'right') ? 'right' : (formData.signatureAlign === 'center' ? 'center' : 'left'),
                  fontSize: '11px',
                  marginBottom: '10px',
                  opacity: 0.8
                }}>
                  {formData.city || 'Cidade'}, {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.
                </div>
              )}

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: formData.signatureAlign === 'left' ? 'flex-start' : (formData.signatureAlign === 'right' ? 'flex-end' : 'center')
              }}>
                {formData.showSignatureLine && <div style={{ width: '150px', borderTop: `1px solid ${formData.textColor || '#000000'}`, marginBottom: '4px', opacity: 0.5 }} />}
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
        <BilhetePrint ref={componentRef} data={{ ...formData, content: replaceVariables(formData.content) }} />
      </div>
    </PageContainer>
  );
};

export default BilheteGeneratorPanel;
