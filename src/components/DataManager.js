import React, { useState, useEffect } from 'react';
import { Download, Upload, Save, AlertCircle, HardDrive, Zap, FileText, Plus } from 'lucide-react';
import { calculateDataSize, checkBrowserLimits } from '../utils/dataSizeCalculator';

function DataManager({ wordBooks, sentenceBooks, onImportData, onImportSentenceData }) {
  const [dataSizeInfo, setDataSizeInfo] = useState(null);
  const [compressionEnabled, setCompressionEnabled] = useState(false);
  const [headerImage, setHeaderImage] = useState(localStorage.getItem('headerImage') || '');
  const [showSentenceJsonInput, setShowSentenceJsonInput] = useState(false);
  const [sentenceJsonInput, setSentenceJsonInput] = useState('');
  const [activeTab, setActiveTab] = useState('wordbooks'); // 'wordbooks' or 'sentencebooks'

  // 데이터 크기 계산
  useEffect(() => {
    if (wordBooks.length > 0 || sentenceBooks.length > 0) {
      const allData = { wordBooks, sentenceBooks };
      const sizeInfo = calculateDataSize(allData);
      const limits = checkBrowserLimits(sizeInfo.bytes);
      setDataSizeInfo({ ...sizeInfo, ...limits });
    }
  }, [wordBooks, sentenceBooks]);

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
      wordBooks: wordBooks,
      sentenceBooks: sentenceBooks
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
    link.download = `엘리의_학습장_백업_${new Date().toISOString().split('T')[0]}${compressionEnabled ? '_compressed' : ''}.json`;
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
        // 새 분기: 배열로 시작하면 sentenceBooks로 간주
        if (Array.isArray(importedData)) {
          const confirmImport = window.confirm(
            `${importedData.length}개의 문장북을 가져오시겠습니까?\n현재 문장북 데이터와 합쳐집니다.`
          );
          if (confirmImport) {
            onImportSentenceData(importedData);
            alert('문장북을 성공적으로 가져왔습니다! 🎉');
          }
          return;
        }
        // 기존: 전체 백업 객체
        if (!importedData.wordBooks && !importedData.sentenceBooks) {
          alert('올바르지 않은 파일 형식입니다.');
          return;
        }
        let importMessage = '';
        if (importedData.wordBooks && Array.isArray(importedData.wordBooks)) {
          importMessage += `${importedData.wordBooks.length}개의 단어장\n`;
        }
        if (importedData.sentenceBooks && Array.isArray(importedData.sentenceBooks)) {
          importMessage += `${importedData.sentenceBooks.length}개의 문장북\n`;
        }
        const confirmImport = window.confirm(
          `${importMessage}을(를) 가져오시겠습니까?\n현재 데이터와 합쳐집니다.`
        );
        if (confirmImport) {
          if (importedData.wordBooks) {
            onImportData(importedData.wordBooks);
          }
          if (importedData.sentenceBooks) {
            onImportSentenceData(importedData.sentenceBooks);
          }
          alert('데이터를 성공적으로 가져왔습니다! 🎉');
        }
      } catch (error) {
        alert('파일을 읽는 중 오류가 발생했습니다.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // 문장북 JSON 직접 입력 처리
  const handleSentenceJsonImport = () => {
    try {
      const parsedData = JSON.parse(sentenceJsonInput);
      
      if (!Array.isArray(parsedData)) {
        alert('JSON 데이터는 배열 형태여야 합니다.');
        return;
      }
      
      // 문장북 데이터 구조 검증
      const validData = parsedData.filter(item => 
        item.title && 
        (item.sentences === undefined || Array.isArray(item.sentences))
      );
      
      if (validData.length === 0) {
        alert('올바른 문장북 데이터가 없습니다. 각 항목에 title이 필요합니다.');
        return;
      }
      
      const confirmImport = window.confirm(
        `${validData.length}개의 문장북을 가져오시겠습니까?\n` +
        `현재 문장북 데이터와 합쳐집니다.`
      );
      
      if (confirmImport) {
        onImportSentenceData(validData);
        setSentenceJsonInput('');
        setShowSentenceJsonInput(false);
        alert('문장북을 성공적으로 가져왔습니다! 🎉');
      }
    } catch (error) {
      alert('JSON 형식이 올바르지 않습니다.');
      console.error('JSON parse error:', error);
    }
  };

  // 헤더 이미지 업로드 핸들러
  const handleHeaderImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      localStorage.setItem('headerImage', ev.target.result);
      setHeaderImage(ev.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeHeaderImage = () => {
    localStorage.removeItem('headerImage');
    setHeaderImage('');
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
      
      {/* 헤더 이미지 업로드 */}
      <div style={{
        background: '#f8f9fa',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        flexWrap: 'wrap'
      }}>
        <div>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>앱 상단 이미지(프로필/로고) 업로드</div>
          <label className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '14px', padding: '7px 16px', marginRight: 8 }}>
            이미지 선택
            <input type="file" accept="image/*" onChange={handleHeaderImageChange} style={{ display: 'none' }} />
          </label>
          {headerImage && (
            <button className="btn btn-small" style={{ background: '#eee', color: '#333', fontSize: '13px' }} onClick={removeHeaderImage}>
              이미지 삭제
            </button>
          )}
        </div>
        {headerImage && (
          <img src={headerImage} alt="미리보기" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px #0001', border: '1.5px solid #e5e7eb' }} />
        )}
      </div>

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
          color: '#13204e'
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
          중요한 단어장과 문장북 데이터를 파일로 저장하고, 다른 기기에서도 사용할 수 있어요!
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

      {/* 탭 네비게이션 */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #eee',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setActiveTab('wordbooks')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: activeTab === 'wordbooks' ? '#6c63ff' : 'transparent',
            color: activeTab === 'wordbooks' ? 'white' : '#666',
            cursor: 'pointer',
            borderBottom: activeTab === 'wordbooks' ? '2px solid #6c63ff' : 'none',
            fontWeight: activeTab === 'wordbooks' ? '500' : 'normal'
          }}
        >
          단어장 ({wordBooks.length})
        </button>
        <button
          onClick={() => setActiveTab('sentencebooks')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: activeTab === 'sentencebooks' ? '#6c63ff' : 'transparent',
            color: activeTab === 'sentencebooks' ? 'white' : '#666',
            cursor: 'pointer',
            borderBottom: activeTab === 'sentencebooks' ? '2px solid #6c63ff' : 'none',
            fontWeight: activeTab === 'sentencebooks' ? '500' : 'normal'
          }}
        >
          문장북 ({sentenceBooks.length})
        </button>
      </div>

      {/* 단어장 탭 */}
      {activeTab === 'wordbooks' && (
        <>
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
              className="btn btn-mint"
              onClick={exportData}
              disabled={wordBooks.length === 0 && sentenceBooks.length === 0}
            >
              <Download size={18} />
              백업 파일 다운로드
            </button>

            {/* 가져오기 버튼 */}
            <label className="btn btn-lavender" style={{ cursor: 'pointer', textAlign: 'center', margin: 0 }}>
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

          {(wordBooks.length === 0 && sentenceBooks.length === 0) && (
            <p style={{ 
              color: '#999',
              fontSize: '14px',
              textAlign: 'center',
              marginTop: '12px',
              marginBottom: 0
            }}>
              단어장과 문장북이 없어서 백업할 데이터가 없습니다.
            </p>
          )}
        </>
      )}

      {/* 문장북 탭 */}
      {activeTab === 'sentencebooks' && (
        <>
          <div style={{
            background: '#f0f9ff',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '1px solid #bae6fd'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              color: '#0369a1'
            }}>
              <FileText size={16} />
              <span style={{ fontWeight: '500' }}>문장북 JSON 가져오기</span>
            </div>
            <p style={{ 
              color: '#666',
              fontSize: '14px',
              lineHeight: '1.5',
              margin: 0,
              marginBottom: '12px'
            }}>
              JSON 형식으로 문장북 데이터를 대량으로 가져올 수 있어요!
            </p>
            
            {!showSentenceJsonInput ? (
              <button
                className="btn btn-primary"
                onClick={() => setShowSentenceJsonInput(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} />
                JSON으로 문장북 가져오기
              </button>
            ) : (
              <div>
                <textarea
                  value={sentenceJsonInput}
                  onChange={(e) => setSentenceJsonInput(e.target.value)}
                  placeholder={`[
  {
    "title": "기본 인사말",
    "description": "일상적인 인사말 문장들",
    "sentences": [
      {
        "speaker": "Tom",
        "english": "How are you today?",
        "korean": "오늘 어떻게 지내?",
        "blanks": [0, 2, 4]
      },
      {
        "english": "Nice to meet you.",
        "korean": "만나서 반가워.",
        "blanks": [0, 3]
      }
    ]
  }
]`}
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    marginBottom: '12px'
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleSentenceJsonImport}
                    disabled={!sentenceJsonInput.trim()}
                  >
                    가져오기
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowSentenceJsonInput(false);
                      setSentenceJsonInput('');
                    }}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            {/* 내보내기 버튼 */}
            <button
              className="btn btn-mint"
              onClick={exportData}
              disabled={sentenceBooks.length === 0}
            >
              <Download size={18} />
              문장북 백업 다운로드
            </button>

            {/* 가져오기 버튼 */}
            <label className="btn btn-lavender" style={{ cursor: 'pointer', textAlign: 'center', margin: 0 }}>
              <Upload size={18} />
              문장북 백업 가져오기
              <input
                type="file"
                accept=".json"
                onChange={importData}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {sentenceBooks.length === 0 && (
            <p style={{ 
              color: '#999',
              fontSize: '14px',
              textAlign: 'center',
              marginTop: '12px',
              marginBottom: 0
            }}>
              문장북이 없어서 백업할 데이터가 없습니다.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default DataManager; 