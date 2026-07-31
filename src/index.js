import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// TON Manifest File URL (Public Folder သို့မဟုတ် Server ပေါ်က manifest URL)
const manifestUrl = 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test-manifest.json';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>
);

reportWebVitals();