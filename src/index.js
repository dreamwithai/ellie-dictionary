import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 개발환경에서만 서비스워커 비활성화
if ('serviceWorker' in navigator) {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('개발 환경: Service Worker 비활성화');
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(reg => reg.unregister());
    });
  } else {
    // 운영 환경에서는 Service Worker 등록
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(registration => {
          console.log('Service Worker 등록 성공:', registration);
        })
        .catch(error => {
          console.log('Service Worker 등록 실패:', error);
        });
    });
  }
} 