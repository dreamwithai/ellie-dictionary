import React from 'react';
import { Bug } from 'lucide-react';

function DebugInfo({ wordBooks, selectedWordBook }) {
  const checkLocalStorage = () => {
    const stored = localStorage.getItem('ellieDictionary');
    console.log('🔍 localStorage 현재 상태:', stored);
    alert('콘솔에서 localStorage 상태를 확인하세요!');
  };

  const clearLocalStorage = () => {
    if (window.confirm('localStorage를 초기화하시겠습니까?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <Bug size={16} />
        <strong>디버그 정보</strong>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <div>wordBooks 개수: {wordBooks.length}</div>
        <div>selectedWordBook: {selectedWordBook ? selectedWordBook.title : '없음'}</div>
        {selectedWordBook && (
          <div>선택된 단어장 단어 수: {selectedWordBook.words.length}</div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={checkLocalStorage}
          style={{
            background: '#667eea',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px'
          }}
        >
          저장소 확인
        </button>
        
        <button 
          onClick={clearLocalStorage}
          style={{
            background: '#ff4757',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px'
          }}
        >
          저장소 초기화
        </button>
      </div>
    </div>
  );
}

export default DebugInfo; 