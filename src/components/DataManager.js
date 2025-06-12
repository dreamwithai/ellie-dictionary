import React, { useState, useEffect } from 'react';
import { Download, Upload, Save, AlertCircle, HardDrive, Zap } from 'lucide-react';
import { calculateDataSize, checkBrowserLimits } from '../utils/dataSizeCalculator';

function DataManager({ wordBooks, onImportData }) {
  const [dataSizeInfo, setDataSizeInfo] = useState(null);
  const [compressionEnabled, setCompressionEnabled] = useState(false);

  // 데이터 크기 계산
  useEffect(() => {
    if (wordBooks.length > 0) {
      const sizeInfo = calculateDataSize(wordBooks);
      const limits = checkBrowserLimits(sizeInfo.bytes);
      setDataSizeInfo({ ...sizeInfo, ...limits });
    }
  }, [wordBooks]);

  // 데이터 압축 함수 (간단한 JSON 최적화)
  const compressData = (data) => {
    // JSON 문자열에서 불필요한 공백 제거
    return JSON.stringify(data);
  };

  // 데이터 내보내기 (JSON 파일로 다운로드)
  const exportData = () => {
    // 큰 데이터 경고
    if (dataSizeInfo && dataSizeInfo.warnings.length > 0) {
      const confirmExport = window.confirm(
        `⚠️ 데이터 크기가 큽니다 (${dataSizeInfo.readable})\n\n` +
        `경고사항:\n${dataSizeInfo.warnings.join('\n')}\n\n` +
        `계속 진행하시겠습니까?`
      );
      if (!confirmExport) return;
    }

    const dataToExport = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      compressed: compressionEnabled,
      wordBooks: wordBooks
    };
    
    // 압축 여부에 따라 다르게 처리
    const dataStr = compressionEnabled 
      ? compressData(dataToExport)
      : JSON.stringify(dataToExport, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const actualSize = dataBlob.size;
    
    console.log(`📦 백업 파일 크기: ${(actualSize / 1024).toFixed(2)} KB`);
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `엘리의_단어장_백업_${new Date().toISOString().split('T')[0]}${compressionEnabled ? '_compressed' : ''}.json`;
    link.click();
    
    URL.revokeObjectURL(link.href);
  };

  // 데이터 가져오기 (JSON 파일 업로드)
  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // 데이터 유효성 검사
        if (!importedData.wordBooks || !Array.isArray(importedData.wordBooks)) {
          alert('올바르지 않은 파일 형식입니다.');
          return;
        }
        
        const confirmImport = window.confirm(
          `${importedData.wordBooks.length}개의 단어장을 가져오시겠습니까?\n` +
          `현재 데이터와 합쳐집니다.`
        );
        
        if (confirmImport) {
          onImportData(importedData.wordBooks);
          alert('데이터를 성공적으로 가져왔습니다! 🎉');
        }
      } catch (error) {
        alert('파일을 읽는 중 오류가 발생했습니다.');
        console.error('Import error:', error);
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // 파일 선택 초기화
  };

  return (
    <div className="card">
      <h3 style={{ 
        color: '#333', 
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Save size={20} />
        데이터 백업 & 복원
      </h3>
      
      <div style={{ 
        background: '#f8f9fa',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
          color: '#667eea'
        }}>
          <AlertCircle size={16} />
          <span style={{ fontWeight: '500' }}>안전한 백업</span>
        </div>
        <p style={{ 
          color: '#666',
          fontSize: '14px',
          lineHeight: '1.5',
          margin: 0
        }}>
          중요한 단어장 데이터를 파일로 저장하고, 다른 기기에서도 사용할 수 있어요!
        </p>
      </div>

      {/* 데이터 크기 정보 */}
      {dataSizeInfo && (
        <div style={{ 
          background: dataSizeInfo.warnings.length > 0 ? '#fff3cd' : '#d1ecf1',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          border: `1px solid ${dataSizeInfo.warnings.length > 0 ? '#ffeaa7' : '#bee5eb'}`
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            color: dataSizeInfo.warnings.length > 0 ? '#856404' : '#0c5460'
          }}>
            <HardDrive size={16} />
            <span style={{ fontWeight: '500' }}>데이터 크기: {dataSizeInfo.readable}</span>
          </div>
          
          {dataSizeInfo.warnings.length > 0 && (
            <div style={{ fontSize: '13px', color: '#856404' }}>
              ⚠️ {dataSizeInfo.warnings.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* 압축 옵션 */}
      {wordBooks.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
          padding: '12px',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <input
            type="checkbox"
            id="compression"
            checked={compressionEnabled}
            onChange={(e) => setCompressionEnabled(e.target.checked)}
            style={{ marginRight: '4px' }}
          />
          <label htmlFor="compression" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}>
            <Zap size={14} />
            압축 백업 (파일 크기 줄이기)
          </label>
        </div>
      )}

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
      }}>
        {/* 내보내기 버튼 */}
        <button
          className="btn btn-primary"
          onClick={exportData}
          disabled={wordBooks.length === 0}
        >
          <Download size={18} />
          백업 파일 다운로드
        </button>

        {/* 가져오기 버튼 */}
        <label className="btn btn-secondary" style={{ 
          cursor: 'pointer',
          textAlign: 'center',
          margin: 0
        }}>
          <Upload size={18} />
          백업 파일 가져오기
          <input
            type="file"
            accept=".json"
            onChange={importData}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {wordBooks.length === 0 && (
        <p style={{ 
          color: '#999',
          fontSize: '14px',
          textAlign: 'center',
          marginTop: '12px',
          marginBottom: 0
        }}>
          단어장이 없어서 백업할 데이터가 없습니다.
        </p>
      )}
    </div>
  );
}

export default DataManager; 