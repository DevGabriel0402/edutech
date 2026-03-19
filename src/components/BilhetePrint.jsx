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
`;

const NoticeWrapper = styled.div`
  width: 100%;
  padding: ${props => (props.$paddingY ?? 2) + 'px ' + (props.$paddingX || 20) + 'px'};
  box-sizing: border-box;
  page-break-inside: avoid;
  position: relative;
  background-color: ${props => props.$bgColor || '#ffffff'};
  color: ${props => props.$textColor || '#000000'};
  display: flex;
  flex-direction: column;
  border-bottom: 1px dashed ${props => props.$borderColor || '#eeeeee'};
  font-family: ${props => props.$fontFamily || 'Inter'}, sans-serif;
  min-height: 148.5mm;
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
  flex: 1;
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
  margin-top: auto;
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
  
  const notices = Array.from({ length: Number(copyCount) || 4 });
  const qtyPerPage = Number(quantity);

  return (
    <PrintContainer ref={ref}>
        <NoticeGrid $qty={qtyPerPage}>
          {notices.map((_, index) => {
            const isLeft = index % 2 === 0;
            return (
              <NoticeWrapper 
                key={index} 
                $bgColor={bgColor} 
                $textColor={textColor} 
                $borderColor={borderColor}
                $paddingX={paddingX}
                $paddingY={paddingY}
                $fontFamily={fontFamily}
                $isLeft={isLeft}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: (qtyPerPage === '1' && fullPageCentering) ? 'center' : 'flex-start',
                  minHeight: qtyPerPage === 4 ? '128mm' : (qtyPerPage === 2 ? '260mm' : '260mm')
                }}
              >
                {showWatermark && (
                  <Watermark $size={watermarkSize}>
                    <img src={schoolLogo} alt="Watermark" />
                  </Watermark>
                )}
                {showLogoHeader && (
                  <Header 
                    $borderColor={borderColor}
                    style={{ 
                      textAlign: titleAlign,
                      justifyContent: titleAlign === 'center' ? 'center' : (titleAlign === 'right' ? 'flex-end' : 'flex-start'),
                      flexDirection: titleAlign === 'right' ? 'row-reverse' : 'row'
                    }}
                  >
                    <Logo src={schoolLogo} alt="Logo" $size={logoSize} />
                    <HeaderContent>
                      <SchoolName style={{ fontSize: `${schoolFontSize}pt` }}>{schoolName}</SchoolName>
                      <NoticeType style={{ color: textColor }}>Comunicado Escolar</NoticeType>
                    </HeaderContent>
                  </Header>
                )}

                <Content 
                  $qty={qtyPerPage}
                  style={{ 
                    fontSize: `${contentFontSize}pt`, 
                    textAlign: contentAlign,
                    lineHeight: lineHeight,
                    fontWeight: isBold ? 'bold' : 'normal',
                    fontStyle: isItalic ? 'italic' : 'normal'
                  }}
                >
                  {content}
                </Content>

                {showAuthorizationText && (
                  <div style={{ 
                    marginTop: '5mm', 
                    fontSize: `${contentFontSize}pt`,
                    marginBottom: '5mm'
                  }}>
                    <div style={{ marginBottom: '5mm' }}>
                      Autorizo o (a) aluno (a) {(data.variables?.aluno || '________________________________________').toUpperCase()}, da turma {(data.variables?.turma || '____________________').toUpperCase()} a participar da atividade acima referida.
                    </div>
                    <div style={{ marginTop: '10mm', textAlign: 'center' }}>
                      <div style={{ width: '80mm', borderTop: '0.2mm solid black', margin: '0 auto 1.5mm' }} />
                      <div style={{ fontSize: `${contentFontSize * 0.9}pt` }}>Assinatura dos pais ou responsável</div>
                    </div>
                  </div>
                )}

                {showDate && (
                  <DateText 
                    $qty={qtyPerPage}
                    style={{ 
                      textAlign: signatureAlign === 'justify' ? 'right' : signatureAlign,
                      opacity: 0.8
                    }}
                  >
                    {city}, {currentDate}.
                  </DateText>
                )}

                <Footer 
                  $qty={qtyPerPage}
                  style={{ 
                    alignItems: signatureAlign === 'left' ? 'flex-start' : (signatureAlign === 'right' ? 'flex-end' : 'center')
                  }}
                >
                  {showSignatureLine && <SignatureLine $qty={qtyPerPage} $textColor={textColor} />}
                  <SignatoryName style={{ fontSize: `${signatoryFontSize}pt` }}>{finalSignatory}</SignatoryName>
                </Footer>
              </NoticeWrapper>
            );
          })}
        </NoticeGrid>
      </PrintContainer>
  );
});

BilhetePrint.displayName = 'BilhetePrint';

export default BilhetePrint;
