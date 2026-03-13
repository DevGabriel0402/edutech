import React, { forwardRef } from 'react';
import styled from 'styled-components';

const PrintContainer = styled.div`
  width: 210mm;
  min-height: 297mm;
  padding: 4mm;
  background: white;
  margin: 0 auto;
  box-sizing: border-box;

  @media print {
    margin: 0;
    padding: 4mm;
    @page {
      margin: 4mm;
    }
  }
`;

const LabelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 90mm);
  grid-auto-rows: 30mm;
  gap: 5mm;
  justify-content: center;
`;

const LabelWrapper = styled.div`
  width: 90mm;
  height: 30mm;
  border: 1px solid #ccc; /* Light border for cutting guide, can be removed if using pre-cut sheets */
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 5mm;
  box-sizing: border-box;
  overflow: hidden;
  background: white;
  color: black;
  page-break-inside: avoid;
`;

const LogoArea = styled.div`
  width: 35mm;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #eee;
  padding-right: 3mm;
  margin-right: 3mm;

  img {
    max-width: 100%;
    max-height: 20mm;
    object-fit: contain;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const Description = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 16pt;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 2mm;
  line-height: 1.2;
`;

const Identifier = styled.div`
  font-family: 'Outfit', sans-serif;
  font-size: 18pt;
  font-weight: 800;
  letter-spacing: 1px;
`;

const LabelPrint = forwardRef(({ data }, ref) => {
  const { 
    size, customWidth, customHeight, 
    type, description, text, 
    prefix, quantity, startNumber = 1,
    imagePosition, logo 
  } = data;
  
  const currentWidth = size === 'custom' ? customWidth : parseInt(size.split('x')[0]) * 10;
  const currentHeight = size === 'custom' ? customHeight : parseInt(size.split('x')[1]) * 10;

  // Generate sequence or single text
  const identifiers = type === 'prefix' 
    ? Array.from({ length: parseInt(quantity) || 0 }, (_, i) => {
        const num = (parseInt(startNumber) + i).toString().padStart(3, '0');
        return `${prefix}${num}`;
      })
    : Array.from({ length: parseInt(quantity) || 1 }, () => text);

  return (
    <div style={{ display: 'none' }}>
      <PrintContainer ref={ref}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(auto-fill, ${currentWidth}mm)`,
          gap: '5mm',
          justifyContent: 'center'
        }}>
          {identifiers.map((id, index) => (
            <div key={index} style={{
              width: `${currentWidth}mm`,
              height: `${currentHeight}mm`,
              border: '1px solid #ccc',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: imagePosition === 'top' ? 'column' : (imagePosition === 'right' ? 'row-reverse' : 'row'),
              alignItems: 'center',
              padding: '3mm',
              boxSizing: 'border-box',
              overflow: 'hidden',
              background: 'white',
              color: 'black',
              pageBreakInside: 'avoid'
            }}>
              {imagePosition !== 'none' && (
                <div style={{ 
                  width: imagePosition === 'top' ? '100%' : '35%', 
                  height: imagePosition === 'top' ? '40%' : '100%',
                  borderRight: imagePosition === 'left' ? '1px solid #eee' : 'none',
                  borderLeft: imagePosition === 'right' ? '1px solid #eee' : 'none',
                  borderBottom: imagePosition === 'top' ? '1px solid #eee' : 'none',
                  padding: '1mm',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: imagePosition === 'left' ? '2mm' : '0',
                  marginLeft: imagePosition === 'right' ? '2mm' : '0'
                }}>
                  <img src={logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              )}
              <div style={{ 
                flex: 1, 
                textAlign: 'center', 
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                {type === 'prefix' && (
                  <div style={{ 
                    fontFamily: 'Outfit, sans-serif', 
                    fontSize: `${12 * (currentHeight / 30)}pt`, 
                    fontWeight: 700, 
                    textTransform: 'uppercase',
                    lineHeight: 1.1
                  }}>
                    {description}
                  </div>
                )}
                <div style={{ 
                  fontFamily: 'Outfit, sans-serif', 
                  fontSize: `${(type === 'text' ? 14 : 16) * (currentHeight / 30)}pt`, 
                  fontWeight: 800, 
                  letterSpacing: '0.5px',
                  lineHeight: 1.1,
                  wordBreak: 'break-word'
                }}>
                  {id}
                </div>
              </div>
            </div>
          ))}
        </div>
      </PrintContainer>
    </div>
  );
});

LabelPrint.displayName = 'LabelPrint';

export default LabelPrint;
