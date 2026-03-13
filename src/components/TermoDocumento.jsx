import React, { forwardRef } from 'react';
import styled from 'styled-components';
import schoolLogo from '../assets/logo-escola.png';
import { FileCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LogoEscola from '../assets/logo-escola.png';

const PrintContainer = styled.div`
  width: 210mm;
  min-height: 297mm;
  padding: 8mm;
  margin: 0 auto;
  background: white;
  color: #1a1a1a;
  display: flex;
  flex-direction: column;
  line-height: 1;
  font-size: 11pt;

  @media print {
    margin: 0;
    box-shadow: none;
    width: 210mm;
    height: 297mm;
  }
`;

const Page = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1.5pt solid #1a1a1a;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  img {
    height: 70px;
    width: auto;
    object-fit: contain;
  }
`;

const TitleContainer = styled.div`
  margin: 30px 0;
  text-align: center;
  position: relative;
  
  &::before, &::after {
    content: '';
    display: block;
    width: 60px;
    height: 2pt;
    background: #0056b3;
    margin: 10px auto;
  }
`;

const Title = styled.h1`
  font-family: 'Outfit', sans-serif;
  font-size: 18pt;
  font-weight: 800;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0;
`;

const Content = styled.div`
  flex: 1;
  
  p {
    margin-bottom: 12px;
    line-height: 1.5;
  }
`;

const Footer = styled.footer`
  margin-top: auto;
  padding-top: 40px;
`;

const SignatureContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 40px;
`;

const SignatureLine = styled.div`
  width: 350px;
  border-bottom: 1pt solid #1a1a1a;
  margin-bottom: 12px;
`;

const TermoDocumento = forwardRef(({ data, isReturn, dataEntrega }, ref) => {
  const processText = (text) => {
    if (!text) return '';
    const devDisplay = data.dispositivo === 'Outro' ? data.outroDispositivo : data.dispositivo;
    const accDisplay = data.acessorios?.length > 0 ? data.acessorios.join(', ') : '';
    const avariasText = data.avarias || '';
    
    const idLabel = data.docType === 'cpf' ? 'CPF' : data.docType === 'rg' ? 'RG' : 'BM';
    const idValue = data.docType === 'cpf' ? data.cpf : data.docType === 'rg' ? data.rg : data.matricula;

    const processed = text
      .replace(/{{nome}}/g, data.nome || '')
      .replace(/{{escola}}/g, data.escola || '')
      .replace(/{{cpf}}/g, data.cpf ? `"${data.cpf}"` : '')
      .replace(/{{rg}}/g, data.rg ? `"${data.rg}"` : '')
      .replace(/{{cnpj}}/g, data.cnpj || '')
      .replace(/{{matricula}}/g, data.matricula ? `"${data.matricula}"` : '')
      .replace(/{{documento}}/g, idLabel)
      .replace(/{{numeroDoc}}/g, idValue ? `"${idValue}"` : '')
      .replace(/{{vinculo}}/g, data.vinculo || '')
      .replace(/{{cidade}}/g, data.cidade || '')
      .replace(/{{dispositivo}}/g, devDisplay || '')
      .replace(/{{estado}}/g, data.estado || '')
      .replace(/{{avarias}}/g, avariasText)
      .replace(/{{acessorios}}/g, accDisplay)
      .replace(/{{data}}/g, format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }))
      .replace(/{{dataEntrega}}/g, dataEntrega ? format(new Date(dataEntrega + 'T12:00:00'), "dd/MM/yyyy") : '');

    return processed.split('\n')
      .map(line => line.trim())
      .filter(line => {
        if (!line) return false;
        
        // Mantém frases que terminam com dois pontos (geralmente introduções)
        if (line.endsWith(':')) return true;

        if (line.includes(':')) {
          const parts = line.split(':');
          const value = parts.slice(1).join(':').trim();
          if (!value) return false;
        }
        return true;
      })
      .join('\n');

    if (isReturn) {
      return processed
        .replace(/entrega neste ato/g, 'devolve neste ato')
        .replace(/recebe neste ato/g, 'entrega neste ato')
        .replace(/sob as seguintes condições/g, 'conforme as condições de devolução');
    }

    return processed;
  };

  return (
    <div>
      <PrintContainer ref={ref}>
        <Page>
          <div style={{ fontSize: '8pt', textAlign: 'right', color: '#666', marginBottom: '5px', fontStyle: 'italic' }}>
            Documento gerado eletronicamente em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
          </div>
          
          <Header>
            <Logo>
              <img src={schoolLogo} alt="Logo da Escola" />
            </Logo>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12pt', fontWeight: 800, color: '#1a1a1a', textTransform: 'uppercase' }}>
                {data.escola || 'Instituição de Ensino'}
              </div>
              <div style={{ fontSize: '10pt', color: '#444' }}>
                {data.cidade || 'Localidade'}
              </div>
            </div>
          </Header>

          <TitleContainer>
            <Title>{isReturn ? 'Termo de Devolução e Recebimento' : 'Termo de Compromisso e Uso'}</Title>
          </TitleContainer>

          <Content>
            {(data.sections || []).map((section) => {
              const label = section.label?.toLowerCase() || '';
              const isBold = label.includes('bold');
              const isJuridico = label.includes('jurídico');
              const isDestaque = label.includes('destaque');

              const sectionBaseStyle = { 
                marginBottom: '20px',
                padding: isDestaque ? '15px' : '0',
                background: isDestaque ? '#f4f7fa' : 'transparent',
                borderRadius: isDestaque ? '6px' : '0',
                border: isDestaque ? '1pt solid #d1d9e6' : 'none',
                fontWeight: isBold ? 700 : 400,
                fontSize: isJuridico ? '9pt' : '11pt',
                lineHeight: isJuridico ? '1.3' : '1.5',
                color: '#1a1a1a'
              };

              return (
                <div key={section.id || Math.random().toString()} style={sectionBaseStyle}>
                  {section.title && (
                    <div style={{ 
                      borderLeft: `3pt solid ${isDestaque ? '#1a1a1a' : '#0056b3'}`,
                      paddingLeft: '10px',
                      marginBottom: '10px'
                    }}>
                      <h3 style={{ 
                        fontSize: isJuridico ? '11pt' : '12pt', 
                        textTransform: 'uppercase',
                        color: isDestaque ? '#1a1a1a' : '#0056b3',
                        fontWeight: 800,
                        margin: 0
                      }}>
                        {section.title}
                      </h3>
                    </div>
                  )}

                  {section.type === 'paragraph' && (
                    <p style={{ textAlign: 'justify', whiteSpace: 'pre-wrap', margin: 0 }}>
                      {processText(section.content)}
                    </p>
                  )}

                  {section.type === 'steps' && (
                    <div style={{ marginTop: '10px' }}>
                      {Array.isArray(section.content) && section.content
                        .filter(step => processText(step.title).trim() !== '' || processText(step.text).trim() !== '')
                        .map((step, sIdx) => (
                          <div key={sIdx} style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
                            <div style={{ 
                              background: '#f0f4f8', 
                              color: '#0056b3', 
                              fontWeight: 800, 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '50%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontSize: '10pt',
                              flexShrink: 0
                            }}>
                              {sIdx + 1}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '11pt', color: '#1a1a1a' }}>{processText(step.title)}</div>
                              <div style={{ fontSize: '10pt', color: '#444', marginTop: '2px' }}>{processText(step.text)}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {section.type === 'grid' && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px 25px',
                      marginTop: '10px',
                      background: '#fcfcfc',
                      padding: '10px',
                      borderRadius: '4px',
                      border: '0.5pt solid #eee'
                    }}>
                      {Array.isArray(section.content) && section.content
                        .filter(item => processText(item.text).trim() !== '')
                        .map((item, iIdx) => (
                          <div key={iIdx} style={{ fontSize: '10pt', display: 'flex', justifyContent: 'space-between', borderBottom: '0.5pt solid #f0f0f0', paddingBottom: '2px' }}>
                            <span style={{ fontWeight: 700, color: '#666', fontSize: '9pt', textTransform: 'uppercase' }}>{processText(item.title)}</span>
                            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{processText(item.text)}</span>
                          </div>
                        ))}
                    </div>
                  )}

                  {section.type === 'list' && (
                    <ul style={{ margin: '10px 0 0 20px', padding: 0 }}>
                      {Array.isArray(section.content) && section.content
                        .filter(item => processText(item).trim() !== '')
                        .map((item, lIdx) => (
                          <li key={lIdx} style={{ fontSize: '10pt', marginBottom: '5px', color: '#333' }}>
                            {processText(item)}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </Content>

          <Footer>
            <div style={{ textAlign: 'center', marginBottom: '30px', fontSize: '11pt', color: '#444' }}>
              {data.cidade || 'Localidade'}, {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>
            
            <SignatureContainer>
              <SignatureLine />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '12pt', color: '#1a1a1a', textTransform: 'uppercase' }}>
                  {data.nome || 'Assinatura do Interessado'}
                </div>
                {data.docType === 'cpf' && data.cpf && (
                  <div style={{ fontSize: '10pt', color: '#666', marginTop: '2px' }}>
                    CPF: "{data.cpf}"
                  </div>
                )}
                {data.docType === 'rg' && data.rg && (
                  <div style={{ fontSize: '10pt', color: '#666', marginTop: '2px' }}>
                    RG: "{data.rg}"
                  </div>
                )}
                {data.docType === 'matricula' && data.matricula && (
                  <div style={{ fontSize: '10pt', color: '#666', marginTop: '2px' }}>
                    BM: "{data.matricula}"
                  </div>
                )}
              </div>
            </SignatureContainer>
          </Footer>
        </Page>
      </PrintContainer>
    </div>
  );
});

export default TermoDocumento;
