import React, { forwardRef } from 'react';
import styled from 'styled-components';
import schoolLogo from '../assets/logo-escola.png';

const PrintContainer = styled.div`
  display: none;
  @media print {
    display: block;
    padding: 0;
    margin: 0;
  }
`;

const Page = styled.div`
  width: 297mm;
  height: 210mm;
  padding: 10mm;
  background: white;
  color: black;
  box-sizing: border-box;
  page-break-after: always;
  font-family: 'Arial', sans-serif;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 5px;
  height: 80px;
`;

const LogoArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150px;
  
  img {
    height: 45px;
    object-fit: contain;
  }
  
  span {
    font-size: 8px;
    font-weight: 800;
    text-align: center;
    margin-top: 2px;
    text-transform: uppercase;
  }
`;

const TitleInfo = styled.div`
  text-align: ${props => props.$alignment || 'right'};
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex: 1;

  h1 {
    font-size: ${props => props.$titleSize}px;
    margin: 0;
    font-weight: 400;
    text-transform: uppercase;
  }

  p {
    font-size: ${props => props.$studentSize}px;
    margin: 2px 0 0;
    font-weight: 400;
    text-transform: uppercase;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

const Th = styled.th`
  border: ${props => props.$borderWeight || '1'}px solid black;
  padding: 4px;
  font-size: 13px;
  font-weight: ${props => props.$bold ? '800' : '500'};
  text-align: center;
  height: 280px;
  position: relative;
  vertical-align: middle;
  text-transform: uppercase;
  overflow: hidden;
`;

const VerticalTh = styled(Th)`
  width: 35px;
  
  .vertical-text {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    white-space: nowrap;
    display: flex;
    align-items: center;
    height: 270px;
    font-size: 11px;
    line-height: 1.1;
    text-align: left;
    padding: 5px 0;
    font-weight: ${props => props.$bold ? '800' : '500'};
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Td = styled.td`
  border: ${props => props.$borderWeight || '1'}px solid black;
  height: ${props => props.$height}px;
  padding: 2px;
  font-size: 12px;
`;

const DiarioBordoPrint = forwardRef(({ data }, ref) => {
  const { turma, alunos, ano = '2026', mainTitle, studentLabel, columnLabels, schoolName, styles } = data;

  // If bulk mode, names are newline separated
  const names = alunos ? alunos.split('\n').filter(n => n.trim() !== '') : ['Nome do Aluno'];

  // Calculate row height to fit A4 Landscape (approx 160mm table area)
  // User requested DOUBLE height, then decrease by 25%. So we multiply the calculated height by 1.5.
  const tableAreaHeight = 160; // mm
  const headerHeightMm = (280 * 0.264583); // px to mm
  const availableHeightMm = tableAreaHeight - headerHeightMm;
  const rowCount = parseInt(styles?.rowCount || 25);
  const calculatedRowHeight = ((availableHeightMm / rowCount) * 3.779528) * 1.5; // mm to px, 1.5x original

  return (
    <PrintContainer ref={ref}>
      <style>
        {`
          @page {
            size: landscape;
            margin: 0;
          }
        `}
      </style>
      {names.map((name, index) => (
        <Page key={index}>
          <Header>
            <LogoArea>
              <img src={schoolLogo} alt="Logo" style={{ height: `${styles?.logoSize || 40}px` }} />
            </LogoArea>
            <TitleInfo 
              $alignment={styles?.textAlignment}
              $titleSize={styles?.mainTitleSize}
              $studentSize={styles?.studentLabelSize}
            >
              <h1>{mainTitle} {ano} - Turma: {turma || '________________'}</h1>
              <p>{studentLabel} {name.toUpperCase()}</p>
            </TitleInfo>
          </Header>

          <Table>
            <thead>
              <tr>
                <Th 
                  $borderWeight={styles?.borderWeight} 
                  $bold={styles?.columnsBold}
                  style={{ width: '60px' }}
                >Data</Th>
                {columnLabels?.map((label, i) => (
                  <VerticalTh 
                    key={i} 
                    $borderWeight={styles?.borderWeight}
                    $bold={styles?.columnsBold}
                  ><div className="vertical-text">{label}</div></VerticalTh>
                ))}
                <Th 
                  $borderWeight={styles?.borderWeight} 
                  $bold={styles?.columnsBold}
                  style={{ width: 'auto' }}
                >Outras ocorrências</Th>
                <Th 
                  $borderWeight={styles?.borderWeight} 
                  $bold={styles?.columnsBold}
                  style={{ width: '200px' }}
                >Assinatura do Professor</Th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowCount }).map((_, rIdx) => (
                <tr key={rIdx}>
                  {Array.from({ length: 15 }).map((_, cIdx) => (
                    <Td 
                      key={cIdx} 
                      $borderWeight={styles?.borderWeight} 
                      $height={calculatedRowHeight} 
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </Page>
      ))}
    </PrintContainer>
  );
});

export default DiarioBordoPrint;
