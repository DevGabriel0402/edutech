import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import schoolLogo from '../assets/logo-escola.png';

const PrintContainer = styled.div`
  width: 210mm;
  min-height: 297mm;
  padding: 0;
  background: white;
  margin: 0 auto;
  box-sizing: border-box;

  @media print {
    margin: 0 !important;
    padding: 0 !important;
    @page {
      margin: 0;
      size: A4;
    }
  }
`;

const NoticeGrid = styled.div`
  display: block;
  width: 210mm;
  background: white;
`;

const NoticeWrapper = styled.div`
  width: 100%;
  padding: ${props => (props.$paddingY ?? 2) + 'px ' + (props.$paddingX || 20) + 'px'};
  box-sizing: border-box;
  page-break-inside: avoid;
  position: relative;
  background-color: ${props => props.$bgColor || '#ffffff'};
  color: ${props => props.$textColor || '#000000'};
  padding: ${props => props.$paddingY || 10}px ${props => props.$paddingX || 20}px;
  border-bottom: 1px dashed ${props => props.$borderColor || '#eeeeee'};
  font-family: ${props => props.$fontFamily || 'Inter'}, sans-serif;
  min-height: ${props => {
    if (props.$qty === 1) return '280mm';
    if (props.$qty === 2) return '140mm';
    if (props.$qty === 3) return '93mm';
    if (props.$qty === 4) return '70mm';
    return 'auto';
  }};
  overflow: visible;
  
  &:last-child {
    border-bottom: none;
  }
`;

const Watermark = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  opacity: 0.1;
  z-index: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 2px solid ${props => props.$borderColor || '#eeeeee'};
  padding-bottom: 4px;
  margin-bottom: 10px;
`;

const Logo = styled.img`
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  object-fit: contain;
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const SchoolName = styled.h2`
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  margin: 0;
  text-transform: uppercase;
  line-height: 1.1;
`;

const NoticeType = styled.p`
  font-size: 10pt;
  margin: 2px 0 0 0;
  opacity: 0.7;
`;

const Content = styled.div`
  margin-bottom: 10px;
  overflow-wrap: break-word !important;
  word-break: normal !important;
  hyphens: none !important;
  text-justify: inter-word;
  display: block;
  width: 100%;
  white-space: pre-wrap;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
`;

const DateText = styled.div`
  font-size: 11pt;
  margin-top: 10px;
  margin-bottom: 10px;
  width: 100%;
`;

const SignatureLine = styled.div`
  width: 100%;
  border-top: 1px solid ${props => props.$textColor || '#000000'};
  margin-bottom: 4px;
  opacity: 0.5;
`;

const SignatoryName = styled.div`
  font-weight: 700;
  text-transform: uppercase;
`;

const BilhetePrint = forwardRef(({ data }, ref) => {
  if (!data) return null;

  const { 
    schoolName = 'Escola',
    schoolLogo = '',
    subtitle = 'Comunicado Escolar',
    content = '',
    signatory = 'Direção',
    customSignatory = '',
    quantity = '4',
    schoolFontSize = 16,
    contentFontSize = 12,
    signatoryFontSize = 11,
    contentAlign = 'justify',
    signatureAlign = 'center',
    titleAlign = 'left',
    logoSize = 40,
    lineHeight = 1.5,
    paddingX = 20,
    paddingY = 20,
    bgColor = '#ffffff',
    textColor = '#000000',
    borderColor = '#eeeeee',
    fontFamily = 'Inter',
    isBold = false,
    isItalic = false,
    city = 'Belo Horizonte',
    copyCount = 4,
    showSignatureLine = true,
    showAuthorizationText = false,
    showDate = true,
    showLogoHeader = true,
    showWatermark = false,
    watermarkSize = 300,
    fullPageCentering = false
  } = data;
  
  const finalSignatory = signatory === 'custom' ? customSignatory : signatory;
  const currentDate = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  const notices = Array.from({ length: Number(copyCount) || 1 });
  const qtyPerPage = Number(quantity);

  // Agrupar em pedaços de acordo com qtyPerPage
  const chunks = [];
  for (let i = 0; i < notices.length; i += qtyPerPage) {
    chunks.push(notices.slice(i, i + qtyPerPage));
  }

  return (
    <PrintContainer ref={ref}>
      {chunks.map((chunk, chunkIndex) => (
        <div key={chunkIndex} style={{ pageBreakAfter: chunkIndex < chunks.length - 1 ? 'always' : 'auto' }}>
          <NoticeGrid $qty={qtyPerPage}>
            {chunk.map((_, indexInChunk) => {
              const globalIndex = (chunkIndex * qtyPerPage) + indexInChunk;
              return (
                <NoticeWrapper
                  key={globalIndex}
                  $bgColor={bgColor}
                  $textColor={textColor}
                  $borderColor={borderColor}
                  $paddingX={paddingX}
                  $paddingY={paddingY}
                  $fontFamily={fontFamily}
                  $qty={qtyPerPage}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: (qtyPerPage === 1 && fullPageCentering) ? 'center' : 'flex-start',
                    pageBreakInside: 'avoid'
                  }}
                >
                  {showWatermark && (
                    <Watermark $size={watermarkSize || 300}>
                      {schoolLogo && <img src={schoolLogo} alt="Marca d'água" />}
                    </Watermark>
                  )}

                  <Header $borderColor={borderColor}>
                    {showLogoHeader && schoolLogo && (
                      <Logo src={schoolLogo} alt="Logo da Escola" $size={logoSize || 50} />
                    )}
                    <HeaderContent>
                      <SchoolName style={{ 
                        fontSize: `${schoolFontSize || 18}pt`,
                        textAlign: titleAlign || 'center'
                      }}>
                        {schoolName || 'NOME DA ESCOLA'}
                      </SchoolName>
                      <NoticeType style={{ textAlign: titleAlign || 'center' }}>
                        {subtitle || 'Comunicado Escolar'}
                      </NoticeType>
                    </HeaderContent>
                  </Header>

                  <Content
                    $fontSize={contentFontSize || 14}
                    $lineHeight={lineHeight || 1.6}
                    $textColor={textColor}
                    style={{ textAlign: contentAlign || 'left' }}
                    dangerouslySetInnerHTML={{ __html: content }}
                  />

                  {showAuthorizationText && (
                    <div style={{ 
                      fontSize: '11pt', 
                      margin: '10px 0', 
                      fontStyle: 'italic',
                      color: textColor || '#000000',
                      opacity: 0.8
                    }}>
                      Autorizo a participação do meu filho(a) nas atividades descritas acima.
                    </div>
                  )}

                  <Footer>
                    {showDate && (
                      <DateText style={{ textAlign: signatureAlign || 'center' }}>
                        {city || 'Cidade'}, {currentDate}
                      </DateText>
                    )}

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: signatureAlign === 'left' ? 'flex-start' : (signatureAlign === 'right' ? 'flex-end' : 'center')
                    }}>
                      {showSignatureLine && <SignatureLine $textColor={textColor} style={{ width: '200px' }} />}
                      <SignatoryName style={{ fontSize: `${signatoryFontSize || 11}pt` }}>
                        {signatory === 'custom' ? (customSignatory || 'Assinatura') : (signatory || 'Direção')}
                      </SignatoryName>
                    </div>
                  </Footer>
                </NoticeWrapper>
              );
            })}
          </NoticeGrid>
        </div>
      ))}
    </PrintContainer>
  );
});

BilhetePrint.displayName = 'BilhetePrint';

export default BilhetePrint;
