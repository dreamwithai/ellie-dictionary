import React from 'react';
import { Search, Book, Eye } from 'lucide-react';

function SearchResults({ searchQuery, searchResults, sentenceResults = [], onViewWordBook }) {
  const getTotalWordsCount = () => {
    return searchResults.reduce((total, result) => total + result.words.length, 0);
  };

  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={index} style={{ 
          background: '#ffeb3b', 
          padding: '2px 4px',
          borderRadius: '3px',
          fontWeight: 'bold'
        }}>
          {part}
        </mark> : part
    );
  };

  if ((searchResults.length === 0) && (!sentenceResults || sentenceResults.length === 0)) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
        <Search size={48} style={{ color: '#ccc', marginBottom: '20px' }} />
        <h3 style={{ marginBottom: '10px', color: '#666' }}>
          '{searchQuery}' 검색 결과가 없습니다
        </h3>
        <p style={{ color: '#999' }}>
          다른 단어 또는 문장으로 검색해보세요!
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* 단어 결과 */}
      {searchResults.length > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#333', marginBottom: '8px' }}>
              🔍 단어 검색 결과
            </h2>
            <p style={{ color: '#666', fontSize: '16px', marginBottom: '12px' }}>
              '<strong style={{ color: '#13204e' }}>{searchQuery}</strong>'에 대한 단어 검색 결과
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: '16px',
              color: '#888',
              fontSize: '14px'
            }}>
              <span>단어장 {searchResults.length}개</span>
              <span>•</span>
              <span>단어 {getTotalWordsCount()}개</span>
            </div>
          </div>
        </div>
      )}
      {/* 단어 결과 카드들 */}
      {searchResults.map((result, index) => (
        <div key={result.wordBook.id} className="card">
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h3 style={{ 
                color: '#333', 
                fontSize: '1.3em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Book size={20} />
                {result.wordBook.title}
              </h3>
              
              <button
                className="btn btn-secondary btn-small"
                onClick={() => onViewWordBook(result.wordBook)}
              >
                <Eye size={16} />
                단어장 보기
              </button>
            </div>
            
            {result.wordBook.description && (
              <p style={{ color: '#666', marginBottom: '16px' }}>
                {result.wordBook.description}
              </p>
            )}
            
            <div style={{ 
              fontSize: '14px', 
              color: '#888', 
              marginBottom: '16px'
            }}>
              {result.words.length}개의 단어가 검색되었습니다
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gap: '12px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
          }}>
            {result.words.map((word, wordIndex) => (
              <div 
                key={word.id} 
                style={{
                  background: '#f8f9fa',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e9ecef'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '6px' }}>
                      <strong style={{ 
                        fontSize: '16px',
                        color: '#333',
                        display: 'block'
                      }}>
                        {highlightText(word.english, searchQuery)}
                      </strong>
                    </div>
                    
                    <div>
                      <span style={{ 
                        fontSize: '14px',
                        color: '#13204e',
                        fontWeight: '500'
                      }}>
                        {highlightText(word.korean, searchQuery)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 문장 결과 */}
      {sentenceResults && sentenceResults.length > 0 && (
        <div className="card" style={{ marginTop: 32, marginBottom: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#333', marginBottom: '8px' }}>
              📄 문장 검색 결과
            </h2>
            <p style={{ color: '#666', fontSize: '16px', marginBottom: '12px' }}>
              '<strong style={{ color: '#13204e' }}>{searchQuery}</strong>'에 대한 문장 검색 결과
            </p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: '16px',
              color: '#888',
              fontSize: '14px'
            }}>
              <span>문장북 {sentenceResults.length}개</span>
              <span>•</span>
              <span>문장 {sentenceResults.reduce((total, result) => total + result.sentences.length, 0)}개</span>
            </div>
          </div>
        </div>
      )}
      {/* 문장 결과 카드들 */}
      {sentenceResults && sentenceResults.map(result => (
        <div key={result.sentenceBook.id} className="card">
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h3 style={{ 
                color: '#333', 
                fontSize: '1.15em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Book size={18} />
                {result.sentenceBook.title}
              </h3>
            </div>
            {result.sentenceBook.description && (
              <p style={{ color: '#666', marginBottom: '16px' }}>
                {result.sentenceBook.description}
              </p>
            )}
            <div style={{ 
              fontSize: '14px', 
              color: '#888', 
              marginBottom: '16px'
            }}>
              {result.sentences.length}개의 문장이 검색되었습니다
            </div>
          </div>
          <div style={{
            display: 'grid', 
            gap: '12px',
            gridTemplateColumns: '1fr'
          }}>
            {result.sentences.map((sentence, idx) => (
              <div 
                key={sentence.id || idx} 
                style={{
                  background: '#f8f9fa',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e9ecef',
                  marginBottom: 4
                }}
              >
                <div style={{ marginBottom: 6, color: '#13204e', fontWeight: 700, fontSize: 15 }}>
                  {highlightText(sentence.english, searchQuery)}
                </div>
                <div style={{ color: '#666', fontSize: 14 }}>
                  {highlightText(sentence.korean, searchQuery)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SearchResults; 