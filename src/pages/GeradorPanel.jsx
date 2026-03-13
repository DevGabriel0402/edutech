import React, { useRef } from 'react';
import styled from 'styled-components';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import {
  FileText, Printer, ShieldCheck, GraduationCap,
  Trash2, Plus, ChevronDown, ChevronUp,
  Type, Grid as GridIcon, List, Layout,
  Settings, User, MapPin, Mail, Phone,
  Layers, Palette, PlusCircle, History, Calendar, 
  RotateCcw, CheckCircle as CheckIcon, Edit2, Search, Download
} from 'lucide-react';
import TermoDocumento from '../components/TermoDocumento';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, collection, addDoc, query, orderBy, onSnapshot, deleteDoc } from 'firebase/firestore';
import { useSettings } from '../context/SettingsContext';

const schema = z.object({
  escola: z.string().min(2, 'Informe a instituição'),
  cidade: z.string().min(2, 'Informe a cidade'),
  nome: z.string().min(3, 'Informe o nome completo'),
  docType: z.string().default('cpf'),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  cnpj: z.string().optional(),
  matricula: z.string().optional(),
  vinculo: z.string().min(1, 'Selecione o vínculo'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  contato: z.string().optional(),
  dispositivo: z.string().min(1, 'Selecione o dispositivo'),
  outroDispositivo: z.string().optional(),
  estado: z.string().min(1, 'Informe o estado'),
  avarias: z.string().optional(),
  acessorios: z.array(z.string()).default([]),
  sections: z.array(z.object({
    id: z.string(),
    type: z.enum(['paragraph', 'steps', 'grid', 'list']),
    title: z.string(),
    label: z.string().optional(), // Tag like "NORMAL", "LEGAL", "BLUEPRINT"
    content: z.any(), // Array of items or string
    isOpen: z.boolean().default(true),
    isLabelSelectOpen: z.boolean().default(false),
  })),
});

const PageContainer = styled.div`
  max-width: 100%;
  margin: 0;
  padding: 0;
`;

const Card = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--border-radius);
  padding: 30px;
  box-shadow: var(--shadow);
  margin-bottom: 24px;

  @media (max-width: 600px) {
    padding: 16px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 30px;
  }
`;

const HeaderContent = styled.div`
  h1 {
    font-family: 'Outfit', sans-serif;
    font-size: 28px;
    color: white;

    @media (max-width: 600px) {
      font-size: 24px;
    }
  }

  p {
    color: #888;
    font-size: 14px;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 600px) {
    width: 100%;
    
    button {
      flex: 1;
      padding: 10px;
      font-size: 13px;
    }
  }
`;

const SubCard = styled.div`
  background: #0f0f0f;
  border: 1px solid #222;
  border-radius: 8px;
  padding: 20px;
  margin-top: 15px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 12px;
  transition: all 0.2s;

  &:hover {
    border-color: #444;
  }
`;

const Badge = styled.span`
  background: #2a2a2a;
  color: #888;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 10px;
  text-transform: uppercase;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-muted);
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
    border-color: #555;
    outline: none;
    background: #141414;
  }
`;

const Select = styled.select`
  background: #0f0f0f;
  border: 1px solid #262626;
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  font-size: 15px;
  appearance: none;
`;

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SelectToggle = styled.div`
  background: #0f0f0f;
  border: 1px solid #262626;
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #444;
    background: #141414;
  }

  svg {
    transition: transform 0.2s;
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0)'};
    color: #888;
  }
`;

const SelectOptions = styled.div`
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  background: #111;
  border: 1px solid #333;
  border-radius: 8px;
  z-index: 100;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  overflow: hidden;
  display: ${props => props.$isOpen ? 'block' : 'none'};
`;

const StyledOption = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #ccc;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    background: #1a1a1a;
    color: white;
  }

  &::after {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${props => props.$color || '#ff4d4d'};
    opacity: ${props => props.$selected ? 1 : 0};
  }
`;

const Textarea = styled.textarea`
  background: #050505;
  border: 1px solid #222;
  border-radius: 6px;
  padding: 12px;
  color: #ddd;
  font-family: inherit;
  font-size: 14px;
  min-height: 100px;
  width: 100%;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #333;
  }
`;

const AddComponentBar = styled.div`
  background: #111;
  border: 1px dashed #333;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin: 30px 0;
`;

const ComponentOptions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
`;

const IconButton = styled.button`
  background: #1a1a1a;
  border: 1px solid #333;
  color: #aaa;
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  transition: all 0.2s;

  &:hover {
    background: #252525;
    color: white;
    border-color: #444;
  }
`;

const ActionButton = styled.button`
  background: ${props => props.$primary ? 'white' : 'transparent'};
  color: ${props => props.$primary ? 'black' : 'white'};
  border: ${props => props.$primary ? 'none' : '1px solid #333'};
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const SettingsCard = styled(Card)`
  border-color: #333;
  background: #080808;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: #ff4d4d;
  }
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #111;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #ddd;

  button {
    color: #555;
    &:hover { color: #ff4d4d; }
  }
`;

const SectionContainer = styled.div`
  margin-bottom: 20px;
`;

const StepItem = styled.div`
  background: #0a0a0a;
  border: 1px solid #222;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  position: relative;
`;

const DeleteBtn = styled.button`
  color: #ff4d4d;
  background: transparent;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 77, 77, 0.1);
  }
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 10px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #0f0f0f;
  border: 1px solid #222;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  color: #888;

  &:hover {
    border-color: #333;
    background: #141414;
  }

  input {
    width: 16px;
    height: 16px;
    accent-color: white;
  }

  &.active {
    border-color: #555;
    color: white;
    background: #1a1a1a;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: #0a0a0a;
  border: 1px solid #222;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  position: relative;
  padding: 30px;
`;

const GeradorPanel = () => {
  const componentRef = useRef();
  const { settings } = useSettings();
  const primaryColor = settings.primaryColor;
  const [showSettings, setShowSettings] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);
  const [termsHistory, setTermsHistory] = React.useState([]);
  const [returnModal, setReturnModal] = React.useState({ show: false, termId: null, date: format(new Date(), 'yyyy-MM-dd') });
  const [isReturnPrint, setIsReturnPrint] = React.useState(false);
  const [returnTermData, setReturnTermData] = React.useState(null);
  const [returnDate, setReturnDate] = React.useState('');
  const [editHistoryModal, setEditHistoryModal] = React.useState({ show: false, term: null });
  const [historySearch, setHistorySearch] = React.useState('');

  // Persistence Logic: Load from LocalStorage
  const getInitialValue = () => {
    const saved = localStorage.getItem('termo_builder_data');
    const defaultData = {
      escola: 'Escola Modelo de Tecnologia',
      vinculo: 'Aluno',
      dispositivo: 'Chromebook Samsung',
      estado: 'Novo',
      avarias: '',
      acessorios: [],
      docType: 'cpf',
      options: {
        vinculos: ['Aluno', 'Professor', 'Colaborador', 'Responsável'],
        dispositivos: ['Chromebook Samsung', 'Tablet Samsung', 'Tablet Positivo', 'Notebook Lenovo', 'Outro'],
        acessorios: ['Carregador', 'Bolsa', 'Cabo USB', 'Fonte', 'Mouse', 'Fone de Ouvido']
      },
      sections: [
        {
          id: 'corp-1',
          type: 'paragraph',
          title: 'TERMO DE RESPONSABILIDADE DE NOTEBOOK CORPORATIVO',
          label: 'CORPORATIVO',
          content: '{{escola}}, situada na {{cidade}}, inscrita no CNPJ sob o nº {{cnpj}}, entrega neste ato, o {{dispositivo}} (código do produto XXX), a(ao) colaborador(a) {{nome}} portador(a) do {{documento}} sob o nº {{numeroDoc}}, doravante denominado(a) simplesmente "USUÁRIO" sob as seguintes condições:\n\n1. O equipamento deverá ser utilizado ÚNICA e EXCLUSIVAMENTE a serviço da empresa tendo em vista a atividade a ser exercida pelo USUÁRIO;\n\n2. Ficará o USUÁRIO responsável pelo uso e boa conservação do equipamento;\n\n3. O USUÁRIO tem somente a DETENÇÃO, tendo em vista o uso exclusivo para prestação de serviços profissionais e NÃO a PROPRIEDADE do equipamento, sendo terminantemente proibido o empréstimo, aluguel ou cessão deste a terceiros;\n\n4. Ao término da prestação de serviço or do contrato individual de trabalho, o USUÁRIO compromete-se a devolver o equipamento em perfeito estado no mesmo dia em que for comunicado ou comunique seu desligamento, considerando o desgaste natural pelo uso normal do equipamento;\n\nSe o equipamento for danificado ou inutilizado por emprego inadequado, mau uso, negligência ou extravio, a empresa poderá cobrar o valor de um equipamento da mesma marca ou equivalente ao da praça.\n\nDeclaro estar ciente e de acordo com as cláusulas acima.',
          isOpen: true
        }
      ]
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Deep merge to ensure new fields are present if user had an old version saved
        return { ...defaultData, ...parsed, options: { ...defaultData.options, ...parsed.options } };
      } catch (e) {
        return defaultData;
      }
    }
    return defaultData;
  };

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: getInitialValue()
  });

  const formData = watch();

  // Persistence Logic: Save to LocalStorage
  React.useEffect(() => {
    const dataToSave = { ...formData };
    // Clean up temporary UI state from save
    delete dataToSave._vinculoOpen;
    delete dataToSave._dispositivoOpen;
    delete dataToSave._estadoOpen;
    localStorage.setItem('termo_builder_data', JSON.stringify(dataToSave));
  }, [formData]);

  // Firebase Persistence: Load Global Options & Institutional Data
  React.useEffect(() => {
    const loadGlobalSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const remoteData = docSnap.data();
          // Load system options
          if (remoteData.options) {
            setValue('options', { ...formData.options, ...remoteData.options });
          }
          // Load institutional data
          if (remoteData.escola) setValue('escola', remoteData.escola);
          if (remoteData.cidade) setValue('cidade', remoteData.cidade);
          if (remoteData.cnpj) setValue('cnpj', remoteData.cnpj);
        }
      } catch (error) {
        console.error("Error loading settings from Firebase:", error);
      }
    };
    loadGlobalSettings();
  }, [setValue]);

  // Auto-Sync Institutional Data to Firebase (Debounced-like via watch)
  const institutionalData = {
    escola: watch('escola'),
    cidade: watch('cidade'),
    cnpj: watch('cnpj')
  };

  React.useEffect(() => {
    const syncInstitutionalData = async () => {
      if (!institutionalData.escola && !institutionalData.cidade && !institutionalData.cnpj) return;
      try {
        const docRef = doc(db, 'settings', 'global');
        const docSnap = await getDoc(docRef);
        const currentData = docSnap.exists() ? docSnap.data() : {};

        await setDoc(docRef, {
          ...currentData,
          ...institutionalData
        }, { merge: true });
      } catch (error) {
        console.error("Error syncing institutional data:", error);
      }
    };

    const timer = setTimeout(syncInstitutionalData, 2000); // 2s debounce
    return () => clearTimeout(timer);
  }, [institutionalData.escola, institutionalData.cidade, institutionalData.cnpj]);

  // Sync Options to Firebase
  const syncOptionsToFirebase = async (newOptions) => {
    try {
      const docRef = doc(db, 'settings', 'global');
      const docSnap = await getDoc(docRef);
      const currentData = docSnap.exists() ? docSnap.data() : {};

      await setDoc(docRef, { ...currentData, options: newOptions }, { merge: true });
    } catch (error) {
      console.error("Error saving settings to Firebase:", error);
    }
  };

  // Terms History Real-time Listener
  React.useEffect(() => {
    const q = query(collection(db, 'generated_terms'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTermsHistory(history);
    });
    return () => unsubscribe();
  }, []);

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "sections"
  });

  const printResult = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Termo de compromisso - ${formData.nome || ''}`,
  });

  const handlePrint = typeof printResult === 'function' ? printResult : printResult?.handlePrint;

  const onSubmit = async (data) => {
    try {
      // Save to Firebase
      await addDoc(collection(db, 'generated_terms'), {
        ...data,
        createdAt: new Date().toISOString(),
        status: 'Ativo'
      });

      if (handlePrint) {
        handlePrint();
      } else {
        toast.error("Ocorreu um erro ao carregar o sistema de impressão. Tente novamente.");
      }
    } catch (error) {
      console.error("Error saving term:", error);
      toast.error("Erro ao salvar histórico do termo.");
    }
  };

  const onInvalid = (errors) => {
    console.warn("Validation errors:", errors);
    toast.error("Por favor, preencha os campos obrigatórios (Instituição, Cidade, Nome Completo e Vínculo) antes de imprimir.");
  };

  const handleAddOption = async (category, value) => {
    if (!value) return;
    const current = formData.options[category];
    if (current.includes(value)) return;
    const updatedOptions = { ...formData.options, [category]: [...current, value] };
    setValue(`options.${category}`, [...current, value]);
    await syncOptionsToFirebase(updatedOptions);
  };

  const handleRemoveOption = async (category, index) => {
    const current = [...formData.options[category]];
    current.splice(index, 1);
    const updatedOptions = { ...formData.options, [category]: current };
    setValue(`options.${category}`, current);
    await syncOptionsToFirebase(updatedOptions);
  };

  const toggleAcessorio = (item) => {
    const current = formData.acessorios || [];
    if (current.includes(item)) {
      setValue('acessorios', current.filter(i => i !== item));
    } else {
      setValue('acessorios', [...current, item]);
    }
  };

  const applyMask = (name, value, type) => {
    let cleanValue = value.replace(/\D/g, '');
    if (type === 'cpf') {
      if (cleanValue.length > 11) cleanValue = cleanValue.slice(0, 11);
      cleanValue = cleanValue.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else if (type === 'phone') {
      if (cleanValue.length > 11) cleanValue = cleanValue.slice(0, 11);
      cleanValue = cleanValue.replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d)(\d{4})$/, '$1-$2');
    } else if (type === 'matricula') {
      if (cleanValue.length === 0) {
        setValue(name, '');
        return;
      }
      if (cleanValue.length > 7) cleanValue = cleanValue.slice(-7);
      const padded = cleanValue.padStart(7, '0');
      cleanValue = padded.replace(/(\d{3})(\d{3})(\d)/, '$1.$2-$3');
    }
    setValue(name, cleanValue);
  };

  const addSection = (type) => {
    const uniqueId = `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const sectionTemplates = {
      paragraph: { id: uniqueId, type: 'paragraph', title: 'Novo Parágrafo', label: 'Normal', content: '', isOpen: true, isLabelSelectOpen: false },
      steps: { id: uniqueId, type: 'steps', title: 'Novos Passos', label: 'Jurídico', content: [{ title: '', text: '' }], isOpen: true, isLabelSelectOpen: false },
      grid: { id: uniqueId, type: 'grid', title: 'Grade de Informações', label: 'Normal', content: [{ title: '', text: '' }], isOpen: true, isLabelSelectOpen: false },
      list: { id: uniqueId, type: 'list', title: 'Lista de Itens', label: 'Normal', content: [''], isOpen: true, isLabelSelectOpen: false }
    };
    append(sectionTemplates[type]);
  };

  return (
    <PageContainer>
      <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
        {/* Header Section */}
        <PageHeader>
          <HeaderContent>
            <h1>Builder de Termos Premium</h1>
            <p>Crie documentos estruturados com componentes SaaS.</p>
          </HeaderContent>
          <ActionGroup>
            <ActionButton type="button" onClick={() => setShowHistory(true)}>
              <History size={18} /> Histórico
            </ActionButton>
            <ActionButton type="button" onClick={() => setShowSettings(!showSettings)}>
              <Settings size={18} /> {showSettings ? 'Fechar' : 'Ajustes'}
            </ActionButton>
            <ActionButton type="submit" $primary><Printer size={18} /> Imprimir</ActionButton>
          </ActionGroup>
        </PageHeader>

        {showHistory && (
          <ModalOverlay>
            <ModalContent style={{ maxWidth: '1000px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <History size={24} color={primaryColor} />
                  <h2 style={{ fontSize: '22px', fontFamily: 'Outfit', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Histórico de Termos Gerados
                    <span style={{ 
                      background: primaryColor, 
                      color: 'white', 
                      fontSize: '12px', 
                      padding: '2px 8px', 
                      borderRadius: '20px', 
                      fontWeight: 800,
                      boxShadow: `0 0 10px ${primaryColor}44`
                    }}>
                      {termsHistory.length} {termsHistory.length === 1 ? 'termo' : 'termos'}
                    </span>
                  </h2>
                </div>
                <ActionButton type="button" $primary onClick={() => setShowHistory(false)}>Fechar</ActionButton>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                  <Input 
                    placeholder="Pesquisar por nome..." 
                    style={{ paddingLeft: '45px', background: '#0a0a0a', borderColor: '#222' }}
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ccc', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
                      <th style={{ padding: '15px' }}>Data</th>
                      <th style={{ padding: '15px' }}>Nome</th>
                      <th style={{ padding: '15px' }}>Dispositivo</th>
                      <th style={{ padding: '15px' }}>Status</th>
                      <th style={{ padding: '15px', textAlign: 'right' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {termsHistory
                      .filter(t => t.nome?.toLowerCase().includes(historySearch.toLowerCase()))
                      .map(term => (
                        <tr key={term.id} style={{ borderBottom: '1px solid #222' }}>
                        <td style={{ padding: '15px' }}>{format(new Date(term.createdAt), 'dd/MM/yyyy')}</td>
                        <td style={{ padding: '15px' }}>
                          <div style={{ fontWeight: 600, color: 'white' }}>{term.nome}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{term.cpf || term.rg || term.matricula}</div>
                        </td>
                        <td style={{ padding: '15px' }}>{term.dispositivo}</td>
                        <td style={{ padding: '15px' }}>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '12px', 
                            fontSize: '11px', 
                            background: term.status === 'Devolvido' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                            color: term.status === 'Devolvido' ? '#22c55e' : '#3b82f6'
                          }}>
                            {term.status}
                          </span>
                        </td>
                        <td style={{ padding: '15px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            {term.status !== 'Devolvido' && (
                              <ActionButton 
                                type="button" 
                                style={{ padding: '6px 12px', fontSize: '12px', borderColor: '#22c55e', color: '#22c55e' }}
                                onClick={() => setReturnModal({ show: true, termId: term.id, date: format(new Date(), 'yyyy-MM-dd') })}
                              >
                                <RotateCcw size={14} /> Devolver
                              </ActionButton>
                            )}
                            <ActionButton 
                              type="button" 
                              style={{ padding: '6px 12px', fontSize: '12px', borderColor: primaryColor, color: primaryColor }}
                              onClick={() => window._triggerHistoryPrint?.(term)}
                            >
                              <Download size={14} />
                            </ActionButton>
                            <ActionButton 
                              type="button" 
                              style={{ padding: '6px 12px', fontSize: '12px', borderColor: primaryColor, color: primaryColor }}
                              onClick={() => setEditHistoryModal({ show: true, term: { ...term } })}
                            >
                              <Edit2 size={14} />
                            </ActionButton>
                            <ActionButton 
                              type="button" 
                              style={{ padding: '6px 12px', fontSize: '12px', borderColor: '#ef4444', color: '#ef4444' }}
                              onClick={async () => {
                                if (window.confirm("Deseja excluir este registro do histórico?")) {
                                  await deleteDoc(doc(db, 'generated_terms', term.id));
                                  toast.success("Registro excluído.");
                                }
                              }}
                            >
                              <Trash2 size={14} />
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {termsHistory.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#555' }}>Nenhum termo gerado ainda.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}

        {returnModal.show && (
          <ModalOverlay style={{ zIndex: 1100 }}>
            <ModalContent style={{ maxWidth: '400px' }}>
              <h3 style={{ color: 'white', marginBottom: '20px', fontFamily: 'Outfit' }}>Registrar Devolução</h3>
              <FormGroup>
                <label>Data de Devolução</label>
                <Input 
                  type="date" 
                  value={returnModal.date} 
                  onChange={(e) => setReturnModal({ ...returnModal, date: e.target.value })}
                />
              </FormGroup>
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <ActionButton type="button" style={{ flex: 1 }} onClick={() => setReturnModal({ ...returnModal, show: false })}>Cancelar</ActionButton>
                <ActionButton 
                  type="button" 
                  $primary 
                  style={{ flex: 1 }}
                  onClick={async () => {
                    const term = termsHistory.find(t => t.id === returnModal.termId);
                    if (term) {
                      try {
                        // Update status in Firebase
                        await setDoc(doc(db, 'generated_terms', term.id), { 
                          status: 'Devolvido', 
                          returnedAt: returnModal.date 
                        }, { merge: true });
                        
                        // Trigger print via wrapper
                        if (window._triggerReturnPrint) {
                          window._triggerReturnPrint(term, returnModal.date);
                        }
                        
                        setReturnModal({ show: false, termId: null, date: '' });
                        
                        // The effect below will trigger print
                        toast.success("Devolução registrada! Gerando termo...");
                      } catch (e) {
                        toast.error("Erro ao registrar devolução.");
                      }
                    }
                  }}
                >
                  <RotateCcw size={14} /> Confirmar
                </ActionButton>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}

        {editHistoryModal.show && (
          <ModalOverlay style={{ zIndex: 1100 }}>
            <ModalContent style={{ maxWidth: '500px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                <Edit2 size={24} color={primaryColor} />
                <h3 style={{ color: 'white', fontFamily: 'Outfit', margin: 0 }}>Editar Registro Histórico</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                <FormGroup>
                  <label>Data de Entrega</label>
                  <Input 
                    type="date" 
                    value={editHistoryModal.term.createdAt ? editHistoryModal.term.createdAt.split('T')[0] : ''} 
                    onChange={(e) => setEditHistoryModal({
                      ...editHistoryModal,
                      term: { ...editHistoryModal.term, createdAt: new Date(e.target.value + 'T12:00:00').toISOString() }
                    })}
                  />
                </FormGroup>

                <FormGroup>
                  <label>Nome Completo</label>
                  <Input 
                    value={editHistoryModal.term.nome || ''} 
                    onChange={(e) => setEditHistoryModal({
                      ...editHistoryModal,
                      term: { ...editHistoryModal.term, nome: e.target.value }
                    })}
                  />
                </FormGroup>

                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '15px' }}>
                  <FormGroup>
                    <label>Tipo Doc</label>
                    <select 
                      value={editHistoryModal.term.docType || 'cpf'}
                      style={{ background: '#0f0f0f', border: '1px solid #262626', color: 'white', padding: '12px', borderRadius: '8px' }}
                      onChange={(e) => setEditHistoryModal({
                        ...editHistoryModal,
                        term: { ...editHistoryModal.term, docType: e.target.value }
                      })}
                    >
                      <option value="cpf">CPF</option>
                      <option value="rg">RG</option>
                      <option value="matricula">BM</option>
                    </select>
                  </FormGroup>
                  <FormGroup>
                    <label>Número do Documento</label>
                    <Input 
                      value={
                        editHistoryModal.term.docType === 'cpf' ? editHistoryModal.term.cpf || '' :
                        editHistoryModal.term.docType === 'rg' ? editHistoryModal.term.rg || '' :
                        editHistoryModal.term.matricula || ''
                      }
                      onChange={(e) => {
                        const type = editHistoryModal.term.docType;
                        let val = e.target.value;
                        const updates = {};
                        
                        if (type === 'matricula') {
                          val = val.replace(/\D/g, '');
                          if (val.length > 0) {
                            if (val.length > 7) val = val.slice(-7);
                            const padded = val.padStart(7, '0');
                            val = padded.replace(/(\d{3})(\d{3})(\d)/, '$1.$2-$3');
                          } else {
                            val = '';
                          }
                        }

                        if (type === 'cpf') updates.cpf = val;
                        else if (type === 'rg') updates.rg = val;
                        else updates.matricula = val;
                        
                        setEditHistoryModal({
                          ...editHistoryModal,
                          term: { ...editHistoryModal.term, ...updates }
                        });
                      }}
                    />
                  </FormGroup>
                </div>

                <FormGroup>
                  <label>Vínculo</label>
                  <Input 
                    value={editHistoryModal.term.vinculo || ''} 
                    onChange={(e) => setEditHistoryModal({
                      ...editHistoryModal,
                      term: { ...editHistoryModal.term, vinculo: e.target.value }
                    })}
                  />
                </FormGroup>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
                <ActionButton type="button" style={{ flex: 1 }} onClick={() => setEditHistoryModal({ show: false, term: null })}>Cancelar</ActionButton>
                <ActionButton 
                  type="button" 
                  $primary 
                  style={{ flex: 1 }}
                  onClick={async () => {
                    try {
                      const { id, ...updates } = editHistoryModal.term;
                      await setDoc(doc(db, 'generated_terms', id), updates, { merge: true });
                      toast.success("Registro atualizado com sucesso!");
                      setEditHistoryModal({ show: false, term: null });
                    } catch (e) {
                      toast.error("Erro ao atualizar registro.");
                    }
                  }}
                >
                  Salvar Alterações
                </ActionButton>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}

        {showSettings && (
          <ModalOverlay>
            <ModalContent>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Settings size={22} color="#ff4d4d" />
                  <h2 style={{ fontSize: '20px', fontFamily: 'Outfit', color: 'white' }}>Configurações do Sistema</h2>
                </div>
                <ActionButton type="button" $primary onClick={() => setShowSettings(false)}>
                  Salvar e Fechar
                </ActionButton>
              </div>

              <div style={{ background: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #222', marginBottom: '20px' }}>
                <p style={{ color: '#888', fontSize: '13px', lineHeight: '1.5' }}>
                  <ShieldCheck size={14} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                  As alterações feitas aqui são aplicadas instantaneamente e ficam salvas no seu navegador.
                </p>
              </div>

              <FormGrid>
                <FormGroup>
                  <label>Vínculos Disponíveis</label>
                  {formData.options.vinculos.map((v, i) => (
                    <OptionItem key={i}>
                      {v} <button type="button" onClick={() => handleRemoveOption('vinculos', i)}><Trash2 size={12} /></button>
                    </OptionItem>
                  ))}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <Input id="newVinculo" placeholder="Novo vínculo" />
                    <IconButton type="button" onClick={() => {
                      const el = document.getElementById('newVinculo');
                      handleAddOption('vinculos', el.value);
                      el.value = '';
                    }}><Plus size={14} /></IconButton>
                  </div>
                </FormGroup>

                <FormGroup>
                  <label>Dispositivos Disponíveis</label>
                  {formData.options.dispositivos.map((d, i) => (
                    <OptionItem key={i}>
                      {d} <button type="button" onClick={() => handleRemoveOption('dispositivos', i)}><Trash2 size={12} /></button>
                    </OptionItem>
                  ))}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <Input id="newDispositivo" placeholder="Novo dispositivo" />
                    <IconButton type="button" onClick={() => {
                      const el = document.getElementById('newDispositivo');
                      handleAddOption('dispositivos', el.value);
                      el.value = '';
                    }}><Plus size={14} /></IconButton>
                  </div>
                </FormGroup>

                <FormGroup>
                  <label>Acessórios Disponíveis</label>
                  {formData.options.acessorios.map((a, i) => (
                    <OptionItem key={i}>
                      {a} <button type="button" onClick={() => handleRemoveOption('acessorios', i)}><Trash2 size={12} /></button>
                    </OptionItem>
                  ))}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <Input id="newAcessorio" placeholder="Novo acessório" />
                    <IconButton type="button" onClick={() => {
                      const el = document.getElementById('newAcessorio');
                      handleAddOption('acessorios', el.value);
                      el.value = '';
                    }}><Plus size={14} /></IconButton>
                  </div>
                </FormGroup>
              </FormGrid>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* Global Data Card */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px', color: '#888' }}>
            <User size={18} /> <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Dados da Instituição & Aluno</span>
          </div>
          <FormGrid>
            <FormGroup>
              <label>Instituição</label>
              <Input {...register('escola')} placeholder="Nome da Escola" />
            </FormGroup>
            <FormGroup>
              <label>Cidade</label>
              <Input {...register('cidade')} placeholder="Ex: Rio de Janeiro - RJ" />
            </FormGroup>
            <FormGroup>
              <label>CNPJ da Empresa</label>
              <Input {...register('cnpj')} placeholder="00.000.000/0000-00" />
            </FormGroup>
            <FormGroup>
              <label>Vínculo</label>
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => setValue('_vinculoOpen', !formData._vinculoOpen)}
                  style={{
                    background: '#0f0f0f',
                    border: '1px solid #262626',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: 'white',
                    fontSize: '15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <span>{formData.vinculo}</span>
                  <ChevronDown size={16} />
                </div>
                {formData._vinculoOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#141414',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    marginTop: '5px',
                    zIndex: 100,
                    boxShadow: 'var(--shadow)',
                    overflow: 'hidden'
                  }}>
                    {formData.options.vinculos.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => {
                          setValue('vinculo', opt);
                          setValue('_vinculoOpen', false);
                        }}
                        style={{
                          padding: '12px 16px',
                          color: formData.vinculo === opt ? 'white' : '#888',
                          background: formData.vinculo === opt ? '#252525' : 'transparent',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'all 0.2s',
                          borderBottom: '1px solid #222'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#222'}
                        onMouseLeave={(e) => e.target.style.background = formData.vinculo === opt ? '#252525' : 'transparent'}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormGroup>
          </FormGrid>
          <FormGrid>
            <FormGroup>
              <label>Nome Completo</label>
              <Input {...register('nome')} placeholder="Nome Sobrenome" />
            </FormGroup>
            <FormGroup>
              <label>Documento do USUÁRIO</label>
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => setValue('_docTypeOpen', !formData._docTypeOpen)}
                  style={{
                    background: '#0f0f0f',
                    border: '1px solid #262626',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: 'white',
                    fontSize: '15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    {formData.docType === 'cpf' ? 'CPF' : formData.docType === 'rg' ? 'RG' : 'BM'}
                  </span>
                  <ChevronDown size={16} />
                </div>
                {formData._docTypeOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#141414',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    marginTop: '5px',
                    zIndex: 100,
                    boxShadow: 'var(--shadow)',
                    overflow: 'hidden'
                  }}>
                    {[
                      { id: 'cpf', label: 'CPF' },
                      { id: 'rg', label: 'RG' },
                      { id: 'matricula', label: 'BM' }
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => {
                          setValue('docType', opt.id);
                          setValue('_docTypeOpen', false);
                        }}
                        style={{
                          padding: '12px 16px',
                          color: formData.docType === opt.id ? 'white' : '#888',
                          background: formData.docType === opt.id ? '#252525' : 'transparent',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'all 0.2s',
                          borderBottom: '1px solid #222'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#222'}
                        onMouseLeave={(e) => e.target.style.background = formData.docType === opt.id ? '#252525' : 'transparent'}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormGroup>

            {/* Conditional Document Input */}
            <FormGroup style={{ gridColumn: 'span 2' }}>
              <label>
                {formData.docType === 'cpf' ? 'Número do CPF' : formData.docType === 'rg' ? 'Número do RG' : 'Número do BM'}
              </label>
              {formData.docType === 'cpf' && (
                <Input {...register('cpf')} placeholder="000.000.000-00" onChange={(e) => applyMask('cpf', e.target.value, 'cpf')} />
              )}
              {formData.docType === 'rg' && (
                <Input {...register('rg')} placeholder="00.000.000-0" />
              )}
              {formData.docType === 'matricula' && (
                <Input {...register('matricula')} placeholder="000.000-0" onChange={(e) => applyMask('matricula', e.target.value, 'matricula')} />
              )}
            </FormGroup>
          </FormGrid>
          <FormGrid>
            <FormGroup>
              <label>Dispositivo</label>
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => setValue('_dispositivoOpen', !formData._dispositivoOpen)}
                  style={{
                    background: '#0f0f0f',
                    border: '1px solid #262626',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: 'white',
                    fontSize: '15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <span>{formData.dispositivo || 'Selecione...'}</span>
                  <ChevronDown size={16} />
                </div>
                {formData._dispositivoOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#141414',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    marginTop: '5px',
                    zIndex: 100,
                    boxShadow: 'var(--shadow)',
                    overflow: 'hidden'
                  }}>
                    {formData.options.dispositivos.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => {
                          setValue('dispositivo', opt);
                          setValue('_dispositivoOpen', false);
                        }}
                        style={{
                          padding: '12px 16px',
                          color: formData.dispositivo === opt ? 'white' : '#888',
                          background: formData.dispositivo === opt ? '#252525' : 'transparent',
                          cursor: 'pointer',
                          fontSize: '14px',
                          borderBottom: '1px solid #222'
                        }}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormGroup>
            {formData.dispositivo === 'Outro' && (
              <FormGroup>
                <label>Qual dispositivo?</label>
                <Input {...register('outroDispositivo')} placeholder="Informe o modelo" />
              </FormGroup>
            )}
            <FormGroup>
              <label>Acessórios entregues</label>
              <CheckboxGroup>
                {formData.options.acessorios.map((item) => (
                  <CheckboxItem key={item} className={formData.acessorios?.includes(item) ? 'active' : ''}>
                    <input
                      type="checkbox"
                      checked={formData.acessorios?.includes(item)}
                      onChange={() => toggleAcessorio(item)}
                    />
                    {item}
                  </CheckboxItem>
                ))}
              </CheckboxGroup>
            </FormGroup>
          </FormGrid>
          <FormGrid>
            <FormGroup>
              <label>Estado de Conservação</label>
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => setValue('_estadoOpen', !formData._estadoOpen)}
                  style={{
                    background: '#0f0f0f',
                    border: '1px solid #262626',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: 'white',
                    fontSize: '15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <span>{formData.estado || 'Selecione...'}</span>
                  <ChevronDown size={16} />
                </div>
                {formData._estadoOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#141414',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    marginTop: '5px',
                    zIndex: 100,
                    boxShadow: 'var(--shadow)',
                    overflow: 'hidden'
                  }}>
                    {['Novo', 'Usado em perfeitas condições', 'Usado com avarias leves'].map((opt) => (
                      <div
                        key={opt}
                        onClick={() => {
                          setValue('estado', opt);
                          setValue('_estadoOpen', false);
                        }}
                        style={{
                          padding: '12px 16px',
                          color: formData.estado === opt ? 'white' : '#888',
                          background: formData.estado === opt ? '#252525' : 'transparent',
                          cursor: 'pointer',
                          fontSize: '14px',
                          borderBottom: '1px solid #222'
                        }}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormGroup>
            {formData.estado === 'Usado com avarias leves' && (
              <FormGroup style={{ gridColumn: 'span 2' }}>
                <label>Descreva as avarias</label>
                <Textarea {...register('avarias')} placeholder="Ex: Riscos na tampa, tela com pequena mancha, etc." />
              </FormGroup>
            )}
            <FormGroup>
              <label>E-mail (Opcional)</label>
              <Input {...register('email')} placeholder="exemplo@email.com" />
            </FormGroup>
            <FormGroup>
              <label>Telefone (Opcional)</label>
              <Input {...register('contato')} placeholder="(00) 00000-0000" onChange={(e) => applyMask('contato', e.target.value, 'phone')} />
            </FormGroup>
          </FormGrid>
        </Card>

        {/* Sections Builder */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', padding: '0 10px' }}>
          <Layers size={18} color="#888" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Estrutura do Documento</span>
        </div>

        {fields.map((field, index) => (
          <SectionContainer key={field.id}>
            <SectionHeader onClick={() => update(index, { ...formData.sections[index], isOpen: !formData.sections[index].isOpen })}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {formData.sections[index].isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                <span style={{ marginLeft: '12px', fontWeight: 600, fontSize: '15px' }}>{formData.sections[index].title || 'Sem Título'}</span>
                <Badge>{formData.sections[index].label}</Badge>
              </div>
              <DeleteBtn type="button" onClick={(e) => { e.stopPropagation(); remove(index); }}>
                <Trash2 size={18} />
              </DeleteBtn>
            </SectionHeader>

            {formData.sections[index].isOpen && (
              <SubCard>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <FormGroup>
                    <label>Título da Seção</label>
                    <Input {...register(`sections.${index}.title`)} />
                  </FormGroup>
                  <FormGroup>
                    <label>Tipo de Estilo (Estilo Visual)</label>
                    <SelectContainer>
                      <SelectToggle
                        $isOpen={formData.sections[index].isLabelSelectOpen}
                        onClick={() => update(index, { ...formData.sections[index], isLabelSelectOpen: !formData.sections[index].isLabelSelectOpen })}
                      >
                        <span>{formData.sections[index].label || 'Normal'}</span>
                        <ChevronDown size={16} />
                      </SelectToggle>

                      <SelectOptions $isOpen={formData.sections[index].isLabelSelectOpen}>
                        {[
                          { val: 'Normal', label: 'Estilo Padrão', color: '#888' },
                          { val: 'Bold', label: 'Negrito Intenso', color: '#fff' },
                          { val: 'Jurídico', label: 'Cláusula (Compacto)', color: '#0056b3' },
                          { val: 'Destaque', label: 'Destaque (Aviso)', color: '#ff4d4d' }
                        ].map((opt) => (
                          <StyledOption
                            key={opt.val}
                            $selected={formData.sections[index].label === opt.val}
                            $color={opt.color}
                            onClick={() => {
                              update(index, { ...formData.sections[index], label: opt.val, isLabelSelectOpen: false });
                            }}
                          >
                            {opt.label}
                          </StyledOption>
                        ))}
                      </SelectOptions>
                    </SelectContainer>
                  </FormGroup>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ color: '#444', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>Elementos de Conteúdo</div>
                  <div style={{
                    fontSize: '10px',
                    color: '#666',
                    background: '#111',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    cursor: 'help',
                    border: '1px solid #222'
                  }} title="Tags vinculadas: {{nome}}, {{cpf}}, {{rg}}, {{cnpj}}, {{vinculo}}, {{escola}}, {{dispositivo}}, {{estado}}, {{acessorios}}, {{avarias}}, {{data}}">
                    Tags: <span style={{ color: '#ff4d4d', fontWeight: 600 }}>{'{{nome}}, {{rg}}, {{cnpj}}...'}</span>
                  </div>
                </div>

                {field.type === 'paragraph' && (
                  <Textarea {...register(`sections.${index}.content`)} placeholder="Digite o texto aqui... use {{nome}}, {{escola}}, etc." />
                )}

                {field.type === 'steps' && (
                  <div>
                    {Array.isArray(formData.sections[index].content) && formData.sections[index].content.map((_, sIndex) => (
                      <StepItem key={sIndex}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span style={{ fontSize: '11px', color: primaryColor, fontWeight: 800 }}>PASSO {sIndex + 1}</span>
                          <DeleteBtn type="button" onClick={() => {
                            const newContent = [...formData.sections[index].content];
                            newContent.splice(sIndex, 1);
                            setValue(`sections.${index}.content`, newContent);
                          }}><Trash2 size={14} /></DeleteBtn>
                        </div>
                        <Input style={{ marginBottom: '10px', fontWeight: 600 }} {...register(`sections.${index}.content.${sIndex}.title`)} placeholder="Título do Passo" />
                        <Textarea style={{ minHeight: '60px' }} {...register(`sections.${index}.content.${sIndex}.text`)} placeholder="Descrição do Passo" />
                      </StepItem>
                    ))}
                    <IconButton type="button" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed' }} onClick={() => {
                      const newContent = [...(formData.sections[index].content || []), { title: '', text: '' }];
                      setValue(`sections.${index}.content`, newContent);
                    }}><Plus size={16} /> Adicionar Passo</IconButton>
                  </div>
                )}

                {field.type === 'grid' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {Array.isArray(formData.sections[index].content) && formData.sections[index].content.map((_, gIndex) => (
                        <StepItem key={gIndex}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '11px', color: primaryColor, fontWeight: 800 }}>CARD {gIndex + 1}</span>
                            <DeleteBtn type="button" onClick={() => {
                              const newContent = [...formData.sections[index].content];
                              newContent.splice(gIndex, 1);
                              setValue(`sections.${index}.content`, newContent);
                            }}><Trash2 size={14} /></DeleteBtn>
                          </div>
                          <Input style={{ marginBottom: '10px', fontWeight: 600 }} {...register(`sections.${index}.content.${gIndex}.title`)} placeholder="Título do Card" />
                          <Textarea style={{ minHeight: '60px' }} {...register(`sections.${index}.content.${gIndex}.text`)} placeholder="Detalhes" />
                        </StepItem>
                      ))}
                    </div>
                    <IconButton type="button" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed', marginTop: '10px' }} onClick={() => {
                      const newContent = [...(formData.sections[index].content || []), { title: '', text: '' }];
                      setValue(`sections.${index}.content`, newContent);
                    }}><Plus size={16} /> Adicionar Item ao Grid</IconButton>
                  </div>
                )}

                {field.type === 'list' && (
                  <div>
                    {Array.isArray(formData.sections[index].content) && formData.sections[index].content.map((_, lIndex) => (
                      <div key={lIndex} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                        <div style={{ color: primaryColor }}><List size={16} /></div>
                        <Input style={{ flex: 1 }} {...register(`sections.${index}.content.${lIndex}`)} placeholder="Item da lista" />
                        <DeleteBtn type="button" onClick={() => {
                          const newContent = [...formData.sections[index].content];
                          newContent.splice(lIndex, 1);
                          setValue(`sections.${index}.content`, newContent);
                        }}><Trash2 size={16} /></DeleteBtn>
                      </div>
                    ))}
                    <IconButton type="button" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed' }} onClick={() => {
                      const newContent = [...(formData.sections[index].content || []), ''];
                      setValue(`sections.${index}.content`, newContent);
                    }}><Plus size={16} /> Adicionar Item</IconButton>
                  </div>
                )}
              </SubCard>
            )}
          </SectionContainer>
        ))}

        {/* Add Section Bar */}
        <AddComponentBar>
          <div style={{ fontSize: '11px', color: '#555', fontWeight: 700, textTransform: 'uppercase' }}>Adicionar Componente:</div>
          <ComponentOptions>
            <IconButton type="button" onClick={() => addSection('paragraph')}><Type size={16} /> + Parágrafo</IconButton>
            <IconButton type="button" onClick={() => addSection('grid')}><GridIcon size={16} /> + Grid de Composição</IconButton>
            <IconButton type="button" onClick={() => addSection('steps')}><Layout size={16} /> + Passo a Passo</IconButton>
            <IconButton type="button" onClick={() => addSection('grid')}><Layout size={16} /> + Cards detalhados</IconButton>
            <IconButton type="button" onClick={() => addSection('list')}><List size={16} /> + Lista de Itens</IconButton>
          </ComponentOptions>
        </AddComponentBar>

        <IconButton type="button" style={{ width: '100%', padding: '16px', borderStyle: 'dashed', backgroundColor: 'transparent' }} onClick={() => addSection('paragraph')}>
          <PlusCircle size={18} /> Adicionar Nova Seção ao Manual
        </IconButton>
      </form>

      {/* Hidden Document optimized for Printing */}
      <div style={{ display: 'none' }}>
        <div style={{ display: 'block' }}>
          <TermoDocumento ref={componentRef} data={formData} />
        </div>
      </div>
    </PageContainer>
  );
};

// History Print Component (Handles both original and return reprints)
const HistoryPrintTrigger = ({ data, isReturn, returnDate, onComplete }) => {
  const printRef = useRef();
  const printResult = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${isReturn ? 'Termo de Devolução' : 'Termo de Compromisso'} - ${data.nome}`,
    onAfterPrint: onComplete
  });

  const handlePrint = typeof printResult === 'function' ? printResult : printResult?.handlePrint;

  React.useEffect(() => {
    if (handlePrint) {
      setTimeout(handlePrint, 500);
    }
  }, [handlePrint]);

  return (
    <div style={{ display: 'none' }}>
      <TermoDocumento ref={printRef} data={data} isReturn={isReturn} dataEntrega={returnDate} />
    </div>
  );
};

const PageWrapper = () => {
  const [printState, setPrintState] = React.useState(null);

  // Expose triggers to window for easy access from GeradorPanel
  window._triggerReturnPrint = (data, date) => {
    setPrintState({ data, date, isReturn: true });
  };

  window._triggerHistoryPrint = (data) => {
    setPrintState({ data, isReturn: false });
  };

  return (
    <>
      <GeradorPanel />
      {printState && (
        <HistoryPrintTrigger 
          data={printState.data} 
          isReturn={printState.isReturn}
          returnDate={printState.date} 
          onComplete={() => setPrintState(null)} 
        />
      )}
    </>
  );
};

export default PageWrapper;
