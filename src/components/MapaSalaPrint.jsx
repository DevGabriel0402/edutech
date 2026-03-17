import React, { forwardRef } from 'react';
import styled from 'styled-components';

const PrintContainer = styled.div`
  ${props => !props.$isPreview && `
    display: none;
    @media print {
      display: block;
      padding: 0;
      margin: 0;
    }
  `}
  ${props => props.$isPreview && `
    display: block;
    transform-origin: top center;
    transform: scale(${props.$scale || 1});
    margin-bottom: -${210 * 3.78 * (1 - (props.$scale || 1))}px;
  `}
`;

const Page = styled.div`
  width: 297mm;
  height: 210mm;
  padding: 5mm; /* Reduced margin for maximum space */
  background: white;
  color: black;
  box-sizing: border-box;
  page-break-after: always;
  font-family: 'Arial', sans-serif;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const HeaderGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  height: 45px;
  width: 100%;
  margin: ${props => props.$invert ? '30px 0 0 0' : '0 0 5px 0'};
  padding-left: ${props => props.$hasLeftObj ? '50px' : '0'};
  padding-right: ${props => props.$hasRightObj ? '50px' : '0'};
`;

const HeaderBlock = styled.div`
  border: 1.5px solid black;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  font-weight: bold;
  font-size: 16px;
  background: #fdfdfd;
  height: 100%;
  white-space: nowrap;
  
  &.title {
    justify-content: center;
    font-size: 24px;
    letter-spacing: 1px;
    background: #f0f0f0;
  }
  
  span {
    margin-left: 5px;
    font-weight: normal;
  }
`;

const RoomBox = styled.div`
  flex: 1;
  border: 2px solid black;
  position: relative;
  display: flex;
  flex-direction: ${props => props.$invert ? 'column-reverse' : 'column'};
  padding: 5px; /* Minimal padding for all sides */
`;

const DeskGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${props => props.$cols}, 1fr);
  grid-template-rows: repeat(${props => props.$rows}, 1fr);
  gap: 15px;
  width: 100%;
  height: 100%;
  /* Add padding on the side where objects are to prevent overlap */
  padding-left: ${props => props.$hasLeftObj ? '50px' : '0'};
  padding-right: ${props => props.$hasRightObj ? '50px' : '0'};
`;

const Desk = styled.div`
  border: 1.5px solid black;
  border-radius: 12px;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  box-sizing: border-box;
`;

const SideLabel = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 140px;
  border: 1.5px solid black;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  background: white;
  
  span {
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: rotate(180deg);
  }

  ${props => props.$side === 'right' ? 'right: 5px;' : 'left: 5px;'}
  ${props => {
    if (props.$offset === 'top') return 'top: 10px; transform: none;';
    if (props.$offset === 'bottom') return 'bottom: 10px; top: auto; transform: none;';
    if (props.$offset === 'center') return 'top: 50%; transform: translateY(-50%);';
    return `top: ${props.$offset}; transform: translateY(-50%);`;
  }}
  z-index: 10;
`;

const Chalkboard = styled.div`
  margin: 0 auto;
  width: 60%;
  height: 25px;
  border: 1.5px solid black;
  ${props => props.$invert ? 'border-bottom: none;' : 'border-top: none;'}
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
`;

const MapaSalaPrint = forwardRef(({ data, isPreview, scale = 1 }, ref) => {
  const { 
    serieTurma, 
    numeroSala, 
    cols, 
    rows, 
    professorPos, 
    titlePos, 
    turmaPos, 
    doorSide, 
    doorPos,
    headerPos,
    windowSide,
    chalkboardVisible 
  } = data;

  const renderSlot = (position) => {
    const isProfessor = professorPos === position;
    const isTitle = titlePos === position;
    const isTurma = turmaPos === position;

    if (isTitle) return <HeaderBlock className="title">MAPA DE SALA</HeaderBlock>;
    if (isProfessor) return <HeaderBlock>(Mesa) Professor: <span>__________</span></HeaderBlock>;
    if (isTurma) return <HeaderBlock>Turma: <span>{serieTurma} - {numeroSala}</span></HeaderBlock>;
    
    return <div />; // Empty slot
  };

  return (
    <PrintContainer ref={ref} $isPreview={isPreview} $scale={scale}>
      {!isPreview && (
        <style>
          {`
            @page {
              size: landscape;
              margin: 0;
            }
          `}
        </style>
      )}
      <Page>
        <RoomBox $invert={headerPos === 'bottom'}>
          <HeaderGrid
            $hasLeftObj={doorSide === 'left' || windowSide === 'left'}
            $hasRightObj={doorSide === 'right' || windowSide === 'right'}
          >
            {renderSlot('left')}
            {renderSlot('center')}
            {renderSlot('right')}
          </HeaderGrid>

          {chalkboardVisible && <Chalkboard $invert={headerPos === 'bottom'}>QUADRO</Chalkboard>}
          
          <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
            {windowSide !== 'none' && (
              <>
                <SideLabel $side={windowSide} $offset="30%">
                  <span>Janela</span>
                </SideLabel>
                <SideLabel $side={windowSide} $offset="70%">
                  <span>Janela</span>
                </SideLabel>
              </>
            )}

            <SideLabel 
              $side={doorSide}
              $offset={doorPos}
            >
              <span>Porta</span>
            </SideLabel>

            <DeskGrid 
              $cols={cols} 
              $rows={rows}
              $hasLeftObj={doorSide === 'left' || windowSide === 'left'}
              $hasRightObj={doorSide === 'right' || windowSide === 'right'}
            >
              {Array.from({ length: cols * rows }).map((_, i) => (
                <Desk key={i} />
              ))}
            </DeskGrid>
          </div>
        </RoomBox>
      </Page>
    </PrintContainer>
  );
});

export default MapaSalaPrint;
