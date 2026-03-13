import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --primary: #ffffff;
    --background: #0a0a0a;
    --card-bg: #141414;
    --card-border: #262626;
    --accent: #ff4d4d;
    --text-main: #e5e5e5;
    --text-muted: #888888;
    --border-radius: 12px;
    --shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', sans-serif;
    background-color: var(--background);
    color: var(--text-main);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    min-height: 100vh;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Outfit', sans-serif;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: 'Inter', sans-serif;
  }

  input {
    font-family: 'Inter', sans-serif;
  }

  &::webkit-scrollbar {
    width: 8px;
    background-color: transparent !important;
  }

  &::webkit-scrollbar-track {
    background-color: transparent !important;
  }

  &::webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }

  &::webkit-scrollbar-thumb:hover {
    background: #444;
  }

  /* Print Styles */
  @media print {
    body {
      background-color: white;
    }
    
    .no-print {
      display: none !important;
    }

    @page {
      size: A4;
      margin: 2cm;
    }
  }
`;

export default GlobalStyle;
