import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import gestaoTILogo from '../assets/logo-escola.png'; // Fallback to existing or placeholder

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top right, #0a192f 0%, #020617 100%);
  padding: 20px;
  font-family: 'Outfit', sans-serif;
`;

const LoginCard = styled(motion.div)`
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 24px;
  width: 100%;
  max-width: 420px;
  padding: 40px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const LogoContainer = styled.div`
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  padding: 10px;
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
  img {
    max-width: 100%;
    height: auto;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #94a3b8;
  margin-top: 8px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #38bdf8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  color: #475569;
`;

const StyledInput = styled.input`
  width: 100%;
  background: rgba(2, 6, 23, 0.6);
  border: 1px solid rgba(56, 189, 248, 0.1);
  border-radius: 12px;
  padding: 14px 16px 14px 48px;
  color: white;
  font-size: 15px;
  transition: all 0.2s ease;
  outline: none;

  &:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.1);
    background: rgba(2, 6, 23, 0.8);
  }

  &::placeholder {
    color: #475569;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    color: #38bdf8;
    background: rgba(56, 189, 248, 0.1);
  }
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  margin-top: 5px;
  color: #94a3b8;
  font-size: 14px;

  input {
    display: none;
  }

  .custom-checkbox {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(56, 189, 248, 0.3);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    background: rgba(2, 6, 23, 0.4);
    color: transparent;
  }

  input:checked + .custom-checkbox {
    background: #38bdf8;
    border-color: #38bdf8;
    color: #000;
  }

  &:hover .custom-checkbox {
    border-color: #38bdf8;
  }
`;

const SubmitButton = styled(motion.button)`
  background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Footer = styled.div`
  margin-top: 24px;
  text-align: center;
  font-size: 13px;
  color: #475569;
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/gerador-de-termos";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success("Login realizado com sucesso!");
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
      let message = "Falha ao realizar login.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = "Email ou senha incorretos.";
      } else if (error.code === 'auth/invalid-email') {
        message = "Email inválido.";
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <LoginCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Header>
          <LogoContainer
            as={motion.div}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <img src="/logo-gestao-ti.png" alt="Gestão TI Logo" />
          </LogoContainer>
          <Title>Portal do Gestor</Title>
          <Subtitle>Acesse sua conta para gerenciar documentos</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Email Institucional</Label>
            <InputWrapper>
              <InputIcon><Mail size={20} /></InputIcon>
              <StyledInput 
                type="email" 
                placeholder="exemplo@gestaoti.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <Label>Chave de Acesso</Label>
            <InputWrapper>
              <InputIcon><Lock size={20} /></InputIcon>
              <StyledInput 
                type={showPassword ? "text" : "password"} 
                placeholder="Sua senha segura"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <PasswordToggle 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ocultar senha" : "Ver senha"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </PasswordToggle>
            </InputWrapper>
            
            <CheckboxContainer>
              <input 
                type="checkbox" 
                checked={showPassword} 
                onChange={() => setShowPassword(!showPassword)} 
              />
              <div className="custom-checkbox">
                {showPassword ? <Eye size={14} /> : null}
              </div>
              Mostrar senha
            </CheckboxContainer>
          </InputGroup>

          <SubmitButton 
            type="submit" 
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Autenticando..." : "Acessar Sistema"}
            {!loading && <LogIn size={20} />}
          </SubmitButton>
        </Form>

        <Footer>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <ShieldCheck size={14} /> Sistema Protegido por Gestão TI
          </div>
        </Footer>
      </LoginCard>
    </PageContainer>
  );
};

export default Login;
