import React from 'react';
import { Book, Eye, Trash2, Calendar } from 'lucide-react';

function WordBookList({ wordBooks, onViewWordBook, onDeleteWordBook }) {

  if (wordBooks.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
        <div style={{ fontSize: '4.2em', fontWeight: 900, color: '#13204e', marginBottom: '36px', letterSpacing: '-2px', lineHeight: 1 }}>텅</div>
        <h3 style={{ marginBottom: '10px', color: '#666' }}>아직 단어장이 없습니다</h3>
        <p style={{ color: '#999', whiteSpace: 'pre-line' }}>
          새 단어장을 만들어서
          {'\n'}영어 공부를 시작해보세요!
          <br />
          <strong style={{ color: '#13204e', display: 'block', marginTop: 18, fontWeight: 700, fontSize: '1.1em' }}>YOU CAN DO IT !!</strong>
        </p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // 더 짧은 형식 사용 (예: 24.06.12)
    const year = date.getFullYear().toString().slice(2); // 2024 → 24
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  return (
    <div>
      <h2 style={{ marginTop: '36px', marginBottom: '24px', color: '#13204e', textAlign: 'center', fontWeight: 800 }}>
        내 단어장 목록 ({wordBooks.length}개)
      </h2>
      
      {wordBooks.map(wordBook => (
        <div key={wordBook.id} className="card">
          {/* 상단: 제목, 설명, 버튼 영역 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '12px'
          }}>
            <div style={{ 
              flex: 1
            }}>
              <h3 style={{ 
                fontSize: '1.4em', 
                marginBottom: '8px', 
                color: '#333',
                fontWeight: '600'
              }}>
                {wordBook.title}
              </h3>
              
              {wordBook.description && (
                <p style={{ 
                  color: '#666', 
                  marginBottom: '0',
                  lineHeight: '1.5'
                }}>
                  {wordBook.description}
                </p>
              )}
            </div>
            
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              marginLeft: '16px'
            }}>
              <button
                className="btn btn-small btn-mint"
                onClick={() => onViewWordBook(wordBook)}
                title="단어장 보기"
              >
                <Eye size={16} />
                보기
              </button>
              
              <button
                className="btn btn-small btn-coral"
                onClick={() => {
                  if (window.confirm('정말로 이 단어장을 삭제하시겠습니까?')) {
                    onDeleteWordBook(wordBook.id);
                  }
                }}
                title="단어장 삭제"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* 하단: 단어 개수와 날짜 정보 - 전체 너비 사용 */}
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center', 
            fontSize: '13px',
            color: '#888',
            width: '100%',
            minHeight: '18px',
            flexWrap: 'nowrap'
          }}>
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '3px',
              minWidth: '0',
              flexShrink: 1,
              whiteSpace: 'nowrap'
            }}>
              <Book size={14} />
              <span>{wordBook.words.length}개 단어</span>
            </span>
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '3px',
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}>
              <Calendar size={14} />
              <span>{formatDate(wordBook.createdAt)}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default WordBookList; 