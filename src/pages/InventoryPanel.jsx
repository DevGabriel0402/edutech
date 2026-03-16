import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';
import InventoryPrint from '../components/InventoryPrint';
import {
  Plus, Search, Filter, Box, Monitor, Laptop, Smartphone,
  MoreVertical, Edit2, Trash2, CheckCircle, AlertCircle, AlertTriangle,
  Tag, Hash, MapPin, Package, Download, X, ChevronDown, RotateCcw, User, Settings as SettingsIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '../config/firebase';
import {
  collection, addDoc, getDocs, updateDoc,
  deleteDoc, doc, query, orderBy
} from 'firebase/firestore';
import { useSettings } from '../context/SettingsContext';

const Card = styled.div`
  background: #141414;
  border: 1px solid #262626;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  @media (max-width: 600px) {
    padding: 16px;
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

const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  color: white;
  margin: 0;

  @media (max-width: 600px) {
    font-size: 22px;
  }
`;

const Button = styled.button`
  background: ${props => props.$primary ? (props.$color || 'white') : 'transparent'};
  color: ${props => props.$primary ? (props.$color ? 'white' : 'black') : 'white'};
  border: ${props => props.$primary ? 'none' : '1px solid #333'};
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const SearchBox = styled.div`
  flex: 1;
  position: relative;
  
  input {
    width: 100%;
    background: #0f0f0f;
    border: 1px solid #262626;
    border-radius: 8px;
    padding: 12px 16px 12px 42px;
    color: white;
    font-size: 14px;
    
    &:focus {
      outline: none;
      border-color: #444;
    }
  }
  
  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #555;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin-top: 10px;

  .botoes button{
  background-color: transparent;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 5px 5px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  cursor: pointer;

  &:nth-child(1){
    color: #22c55e;
  }
  &:nth-child(2){
    color: #ef4444;
  }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const Th = styled.th`
  text-align: left;
  padding: 16px;
  border-bottom: 1px solid #262626;
  color: #555;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.5px;
`;

const Td = styled.td`
  padding: 16px;
  border-bottom: 1px solid #1a1a1a;
  color: #ddd;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #1a1a1a;
`;

const PageButton = styled.button`
  background: ${props => props.$active ? props.$color : '#1a1a1a'};
  color: ${props => props.$active ? 'black' : '#888'};
  border: 1px solid ${props => props.$active ? props.$color : '#333'};
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => props.$color};
    color: ${props => props.$active ? 'black' : 'white'};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;



const FilterBar = styled.div`
  display: ${props => props.$show ? 'grid' : 'none'};
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 20px;
  background: #0f0f0f;
  border: 1px solid #222;
  border-radius: 8px;
  margin-bottom: 24px;
  animation: fadeIn 0.3s ease;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 11px;
    font-weight: 600;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const CustomSelect = styled.div`
  position: relative;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: white;
  transition: all 0.2s;

  &:hover {
    border-color: #444;
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  margin-top: 4px;
  z-index: 50;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  overflow: hidden;
`;

const DropdownItem = styled.div`
  padding: 10px 16px;
  font-size: 14px;
  color: ${props => props.$active ? 'white' : '#888'};
  background: ${props => props.$active ? props.$color : 'transparent'};
  
  &:hover {
    background: ${props => props.$active ? props.$color : '#222'};
    color: white;
  }
`;

const DeviceIcon = styled.div`
  width: 36px;
  height: 36px;
  background: #1a1a1a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
`;

const StatusBadge = styled.span`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: ${props => {
    switch (props.$type) {
      case 'disponivel': return 'rgba(156, 163, 175, 0.1)'; // Neutral
      case 'emprestado': return 'rgba(59, 130, 246, 0.1)'; // Blue
      case 'danificado': return 'rgba(239, 68, 68, 0.1)'; // Red
      case 'manutencao': return 'rgba(245, 158, 11, 0.1)'; // Orange
      case 'reserva': return 'rgba(168, 85, 247, 0.1)'; // Purple
      default: return 'rgba(255, 255, 255, 0.05)';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'disponivel': return '#9ca3af';
      case 'emprestado': return '#3b82f6';
      case 'danificado': return '#ef4444';
      case 'manutencao': return '#f59e0b';
      case 'reserva': return '#a855f7';
      default: return '#999';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$type) {
      case 'disponivel': return 'rgba(156, 163, 175, 0.2)';
      case 'emprestado': return 'rgba(59, 130, 246, 0.2)';
      case 'danificado': return 'rgba(239, 68, 68, 0.2)';
      case 'manutencao': return 'rgba(245, 158, 11, 0.2)';
      case 'reserva': return 'rgba(168, 85, 247, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
`;

const TooltipWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  cursor: help;

  &:hover > div {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
`;

const TooltipContent = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: #1a1a1a;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  white-space: pre-wrap;
  width: max-content;
  max-width: 200px;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #333;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  margin-bottom: 10px;
  pointer-events: none;
  font-weight: 500;
  line-height: 1.4;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled(Card)`
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: #888;
  }

  input, select, textarea {
    background: #0f0f0f;
    border: 1px solid #262626;
    border-radius: 8px;
    padding: 12px;
    color: white;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #444;
    }
  }
`;

const InventoryPanel = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();
  const primaryColor = settings.primaryColor;
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const printRef = useRef(null);

  const printResult = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Relatorio_Inventario_' + format(new Date(), 'dd_MM_yyyy'),
  });

  const handlePrint = typeof printResult === 'function' ? printResult : printResult?.handlePrint;

  const [formData, setFormData] = useState({
    tipo: 'Notebook',
    marca: '',
    modelo: '',
    serial: '',
    patrimonio: '',
    status: 'Ativo',
    localizacao: '',
    observacoes: '',
    _tipoOpen: false,
    _statusOpen: false
  });

  const loadInventory = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'inventory'), orderBy('patrimonio', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(data);
    } catch (error) {
      console.error("Error loading inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingItem) {
        await updateDoc(doc(db, 'inventory', editingItem.id), formData);
      } else {
        await addDoc(collection(db, 'inventory'), formData);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({
        tipo: formData.tipo, marca: '', modelo: '',
        serial: '', patrimonio: '', status: formData.status,
        localizacao: '', observacoes: '',
        _tipoOpen: false, _statusOpen: false
      });
      loadInventory();
      toast.success("Item salvo com sucesso!");
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error("Erro ao salvar item: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja realmente excluir este item?")) {
      await deleteDoc(doc(db, 'inventory', id));
      loadInventory();
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Monitor': return <Monitor size={18} />;
      case 'Notebook': return <Laptop size={18} />;
      case 'Tablet': return <Smartphone size={18} />;
      case 'Chromebook': return <Laptop size={18} />;
      default: return <Box size={18} />;
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = (item.modelo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.marca || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.patrimonio || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'Todos' || item.tipo === filterType;
    const matchesStatus = filterStatus === 'Todos' || item.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Title>Inventário de Dispositivos</Title>
          <span style={{ 
            background: primaryColor + '22', 
            color: primaryColor, 
            padding: '4px 12px', 
            borderRadius: '20px', 
            fontSize: '12px', 
            fontWeight: 700,
            border: `1px solid ${primaryColor}44`,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {filteredItems.length} {filteredItems.length === 1 ? 'dispositivo' : 'dispositivos'}
          </span>
        </div>
        <ActionGroup>
          <Button onClick={() => {
            if (filteredItems.length > 0) {
              handlePrint();
            } else {
              toast.error("Não há itens para exportar.");
            }
          }}>
            <Download size={18} /> Exportar
          </Button>
          <Button $primary $color={primaryColor} onClick={() => setShowModal(true)}>
            <Plus size={18} /> Novo Item
          </Button>
        </ActionGroup>
      </Header>

      <Card>
        <Controls>
          <SearchBox>
            <Search size={18} />
            <input
              placeholder="Buscar por modelo, marca ou patrimônio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              borderColor: showFilters ? primaryColor : '#333',
              color: showFilters ? primaryColor : 'white'
            }}
          >
            <Filter size={18} /> Filtros
          </Button>
        </Controls>

        <FilterBar $show={showFilters}>
          <FilterGroup>
            <label>Tipo de Dispositivo</label>
            <CustomSelect onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}>
              {filterType}
              <ChevronDown size={16} />
              {typeDropdownOpen && (
                <Dropdown>
                  {['Todos', 'Notebook', 'Monitor', 'Tablet', 'Chromebook', 'Desktop'].map(type => (
                    <DropdownItem
                      key={type}
                      $active={filterType === type}
                      $color={primaryColor}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilterType(type);
                        setTypeDropdownOpen(false);
                      }}
                    >
                      {type}
                    </DropdownItem>
                  ))}
                </Dropdown>
              )}
            </CustomSelect>
          </FilterGroup>

          <FilterGroup>
            <label>Status</label>
            <CustomSelect onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}>
              {filterStatus}
              <ChevronDown size={16} />
              {statusDropdownOpen && (
                <Dropdown>
                  {['Todos', 'Disponível', 'Emprestado', 'Danificado', 'Manutenção', 'Reserva'].map(status => (
                    <DropdownItem
                      key={status}
                      $active={filterStatus === status}
                      $color={primaryColor}
                      onClick={(e) => {
                        e.stopPropagation();
                        setFilterStatus(status);
                        setStatusDropdownOpen(false);
                      }}
                    >
                      {status}
                    </DropdownItem>
                  ))}
                </Dropdown>
              )}
            </CustomSelect>
          </FilterGroup>

          <FilterGroup style={{ justifyContent: 'flex-end' }}>
            <Button
              onClick={() => {
                setFilterType('Todos');
                setFilterStatus('Todos');
              }}
              style={{ padding: '10px' }}
            >
              <RotateCcw size={16} /> Limpar Filtros
            </Button>
          </FilterGroup>
        </FilterBar>

        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>Item</Th>
                <Th>Marca / Modelo</Th>
                <Th>Nº Série</Th>
                <Th>Patrimônio</Th>
                <Th>Status</Th>
                <Th>Localização</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><Td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Carregando inventário...</Td></tr>
              ) : filteredItems.length === 0 ? (
                <tr><Td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Nenhum item encontrado.</Td></tr>
              ) : paginatedItems.map(item => (
                <tr key={item.id}>
                  <Td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <DeviceIcon>{getIcon(item.tipo)}</DeviceIcon>
                      <span style={{ fontWeight: 600 }}>{item.tipo}</span>
                    </div>
                  </Td>
                  <Td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{item.marca}</span>
                        {item.observacoes && (
                          <TooltipWrapper>
                            <AlertCircle size={14} style={{ color: '#f59e0b' }} />
                            <TooltipContent>{item.observacoes}</TooltipContent>
                          </TooltipWrapper>
                        )}
                      </div>
                      <span style={{ fontSize: '12px', color: '#666' }}>{item.modelo}</span>
                    </div>
                  </Td>
                  <Td style={{ fontFamily: 'monospace', color: '#888' }}>{item.serial}</Td>
                  <Td>
                    <span style={{ background: '#1a1a1a', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      {item.patrimonio}
                    </span>
                  </Td>
                  <Td>
                    <StatusBadge $type={
                      item.status === 'Disponível' ? 'disponivel' :
                      item.status === 'Emprestado' ? 'emprestado' :
                      item.status === 'Danificado' ? 'danificado' :
                      item.status === 'Manutenção' ? 'manutencao' :
                      item.status === 'Reserva' ? 'reserva' : 'disponivel'
                    }>
                      {item.status === 'Disponível' && <CheckCircle size={12} />}
                      {item.status === 'Emprestado' && <User size={12} />}
                      {item.status === 'Danificado' && <AlertTriangle size={12} />}
                      {item.status === 'Manutenção' && <SettingsIcon size={12} />}
                      {item.status === 'Reserva' && <Package size={12} />}
                      {!['Disponível', 'Emprestado', 'Danificado', 'Manutenção', 'Reserva'].includes(item.status) && <CheckCircle size={12} />}
                      {item.status}
                    </StatusBadge>
                  </Td>
                  <Td>{item.localizacao}</Td>
                  <Td>
                    <div className='botoes' style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setFormData(item);
                          setShowModal(true);
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <PaginationContainer>
            <PageButton 
              $color={primaryColor} 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              <ChevronDown size={18} style={{ transform: 'rotate(90deg)' }} />
            </PageButton>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              // Show max 5 page buttons to avoid clutter
              if (
                pageNum === 1 || 
                pageNum === totalPages || 
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <PageButton 
                    key={pageNum}
                    $active={currentPage === pageNum}
                    $color={primaryColor}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </PageButton>
                );
              } else if (
                (pageNum === currentPage - 2 && pageNum > 1) ||
                (pageNum === currentPage + 2 && pageNum < totalPages)
              ) {
                return <span key={pageNum} style={{ color: '#555' }}>...</span>;
              }
              return null;
            })}

            <PageButton 
              $color={primaryColor} 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              <ChevronDown size={18} style={{ transform: 'rotate(-90deg)' }} />
            </PageButton>
          </PaginationContainer>
        )}
      </Card>

      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: 'white', fontFamily: 'Outfit' }}>
                {editingItem ? 'Editar Item' : 'Novo Item de Inventário'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', color: '#555', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <FormGrid>
                <FormGroup>
                  <label>Tipo de Dispositivo</label>
                  <div style={{ position: 'relative' }}>
                    <div
                      onClick={() => setFormData({ ...formData, _tipoOpen: !formData._tipoOpen, _statusOpen: false })}
                      style={{
                        background: '#0f0f0f',
                        border: '1px solid #262626',
                        borderRadius: '8px',
                        padding: '12px',
                        color: 'white',
                        fontSize: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{formData.tipo}</span>
                      <ChevronDown size={16} />
                    </div>
                    {formData._tipoOpen && (
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
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        overflow: 'hidden'
                      }}>
                        {['Notebook', 'Microcomputador', 'Monitor', 'Chromebook', 'Tablet', 'Acessório', 'Outro'].map((opt) => (
                          <div
                            key={opt}
                            onClick={() => setFormData({ ...formData, tipo: opt, _tipoOpen: false })}
                            style={{
                              padding: '12px',
                              color: formData.tipo === opt ? 'white' : '#888',
                              background: formData.tipo === opt ? '#252525' : 'transparent',
                              cursor: 'pointer',
                              fontSize: '13px',
                              borderBottom: '1px solid #222'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#222'}
                            onMouseLeave={(e) => e.target.style.background = formData.tipo === opt ? '#252525' : 'transparent'}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </FormGroup>
                <FormGroup>
                  <label>Marca</label>
                  <input
                    placeholder="Ex: Dell, HP, Samsung"
                    value={formData.marca}
                    onChange={e => setFormData({ ...formData, marca: e.target.value })}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <label>Modelo</label>
                  <input
                    placeholder="Ex: Latitude 3420"
                    value={formData.modelo}
                    onChange={e => setFormData({ ...formData, modelo: e.target.value })}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <label>Identificação / Patrimônio</label>
                  <input
                    placeholder="Ex: TI-001"
                    value={formData.patrimonio}
                    onChange={e => setFormData({ ...formData, patrimonio: e.target.value })}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <label>Número de Série</label>
                  <input
                    placeholder="SN-XXXXXX"
                    value={formData.serial}
                    onChange={e => setFormData({ ...formData, serial: e.target.value })}
                  />
                </FormGroup>
                <FormGroup>
                  <label>Status</label>
                  <div style={{ position: 'relative' }}>
                    <div
                      onClick={() => setFormData({ ...formData, _statusOpen: !formData._statusOpen, _tipoOpen: false })}
                      style={{
                        background: '#0f0f0f',
                        border: '1px solid #262626',
                        borderRadius: '8px',
                        padding: '12px',
                        color: 'white',
                        fontSize: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{formData.status}</span>
                      <ChevronDown size={16} />
                    </div>
                    {formData._statusOpen && (
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
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        overflow: 'hidden'
                      }}>
                        {['Disponível', 'Emprestado', 'Danificado', 'Manutenção', 'Reserva'].map((opt) => (
                          <div
                            key={opt}
                            onClick={() => setFormData({ ...formData, status: opt, _statusOpen: false })}
                            style={{
                              padding: '12px',
                              color: formData.status === opt ? 'white' : '#888',
                              background: formData.status === opt ? '#252525' : 'transparent',
                              cursor: 'pointer',
                              fontSize: '13px',
                              borderBottom: '1px solid #222'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#222'}
                            onMouseLeave={(e) => e.target.style.background = formData.status === opt ? '#252525' : 'transparent'}
                          >
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </FormGroup>
                <FormGroup style={{ gridColumn: 'span 2' }}>
                  <label>Localização / Setor</label>
                  <input
                    placeholder="Ex: Lab de Informática, Secretaria"
                    value={formData.localizacao}
                    onChange={e => setFormData({ ...formData, localizacao: e.target.value })}
                  />
                </FormGroup>
                <FormGroup style={{ gridColumn: 'span 2' }}>
                  <label>Observações</label>
                  <textarea
                    placeholder="Ex: Tecla 'A' falhando, Tela com arranhão leve..."
                    value={formData.observacoes}
                    onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                    style={{ minHeight: '80px', resize: 'vertical' }}
                  />
                </FormGroup>
              </FormGrid>

              <div style={{ marginTop: '30px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Button type="button" onClick={() => setShowModal(false)}>Cancelar</Button>
                <Button type="submit" $primary $color={primaryColor} disabled={saving}>
                  {saving ? 'Salvando...' : editingItem ? 'Salvar Alterações' : 'Cadastrar Item'}
                </Button>
              </div>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}

      <InventoryPrint ref={printRef} items={filteredItems} />
    </div>
  );
};

export default InventoryPanel;
