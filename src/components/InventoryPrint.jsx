import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PrintContainer = styled.div`
  padding: 40px;
  background: white;
  color: black;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  width: 210mm; /* A4 Width */
  margin: 0 auto;

  @media print {
    padding: 0;
    width: 100%;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid #000;
  padding-bottom: 20px;
  margin-bottom: 30px;
`;

const InstitutionInfo = styled.div`
  h1 {
    font-size: 24px;
    margin: 0;
    font-weight: 800;
    text-transform: uppercase;
  }
  p {
    margin: 4px 0 0 0;
    font-size: 14px;
    color: #444;
  }
`;

const ReportMeta = styled.div`
  text-align: right;
  h2 {
    font-size: 18px;
    margin: 0;
    color: #222;
  }
  p {
    margin: 4px 0 0 0;
    font-size: 12px;
    color: #666;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 8px;
  border-bottom: 2px solid #333;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #f8f8f8;
`;

const Td = styled.td`
  padding: 12px 8px;
  border-bottom: 1px solid #eee;
  font-size: 12px;
  vertical-align: top;
`;

const StatusBadge = styled.span`
  font-weight: 700;
  text-transform: uppercase;
  font-size: 10px;
  color: ${props => props.$type === 'Ativo' ? '#166534' : '#991b1b'};
`;

const Footer = styled.div`
  margin-top: 50px;
  font-size: 10px;
  color: #888;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #eee;
  padding-top: 10px;
`;

const InventoryPrint = forwardRef(({ items, institution = "TI - GESTÃO DE ATIVOS" }, ref) => {
  const currentDate = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const currentTime = format(new Date(), "HH:mm");

  return (
    <div style={{ display: 'none' }}>
      <PrintContainer ref={ref}>
        <Header>
          <InstitutionInfo>
            <h1>{institution}</h1>
            <p>Relatório Consolidado de Inventário</p>
          </InstitutionInfo>
          <ReportMeta>
            <h2>LISTA DE DISPOSITIVOS</h2>
            <p>Gerado em: {currentDate} às {currentTime}</p>
          </ReportMeta>
        </Header>

        <Table>
          <thead>
            <tr>
              <Th>Patrimônio</Th>
              <Th>Tipo / Item</Th>
              <Th>Marca / Modelo</Th>
              <Th>Nº Série</Th>
              <Th>Status</Th>
              <Th>Localização</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <Td><strong>{item.patrimonio}</strong></Td>
                <Td>{item.tipo}</Td>
                <Td>
                  <div>{item.marca}</div>
                  <div style={{ fontSize: '10px', color: '#666' }}>{item.modelo}</div>
                </Td>
                <Td style={{ fontFamily: 'monospace' }}>{item.serial || '-'}</Td>
                <Td>
                  <StatusBadge $type={item.status}>{item.status}</StatusBadge>
                </Td>
                <Td>{item.localizacao || '-'}</Td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div style={{ marginTop: '40px', fontSize: '12px' }}>
          <strong>Total de Itens:</strong> {items.length}
        </div>

        <Footer>
          <span>Termo Generator SaaS - Módulo de Inventário</span>
          <span>Página 1 de 1</span>
        </Footer>
      </PrintContainer>
    </div>
  );
});

InventoryPrint.displayName = 'InventoryPrint';

export default InventoryPrint;
