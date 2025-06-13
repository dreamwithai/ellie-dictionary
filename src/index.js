import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker 등록
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('Service Worker 등록 성공:', registration.scope);
      })
      .catch(error => {
        console.log('Service Worker 등록 실패:', error);
      });
  });
} 