import React, { useState } from 'react';
import { Plus, Trash2, Book, Save, X, Edit3, EyeOff, Eye, Check } from 'lucide-react';

function WordBookDetail({ wordBook, onAddWord, onDeleteWord, onUpdateWord }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWord, setNewWord] = useState({ english: '', korean: '' });
  const [editingWordId, setEditingWordId] = useState(null);
  const [editingWord, setEditingWord] = useState({ english: '', korean: '' });
  const [hiddenKorean, setHiddenKorean] = useState(new Set()); // 숨겨진 한글 해석들의 ID 저장
  const [hiddenEnglish, setHiddenEnglish] = useState(new Set()); // 숨겨진 영어 단어들의 ID 저장
  const [memorizedWords, setMemorizedWords] = useState(new Set()); // 외운 단어들의 ID 저장

  const handleAddWord = (e) => {
    e.preventDefault();
    
    if (newWord.english.trim() === '' || newWord.korean.trim() === '') {
      alert('영어 단어와 한글 뜻을 모두 입력해주세요!');
      return;
    }

    onAddWord(wordBook.id, {
      english: newWord.english.trim(),
      korean: newWord.korean.trim()
    });

    setNewWord({ english: '', korean: '' });
    setShowAddForm(false);
  };

  const cancelAdd = () => {
    setNewWord({ english: '', korean: '' });
    setShowAddForm(false);
  };

  // 수정 시작
  const startEdit = (word) => {
    setEditingWordId(word.id);
    setEditingWord({ english: word.english, korean: word.korean });
  };

  // 수정 저장
  const handleUpdateWord = (e) => {
    e.preventDefault();
    
    if (editingWord.english.trim() === '' || editingWord.korean.trim() === '') {
      alert('영어 단어와 한글 뜻을 모두 입력해주세요!');
      return;
    }

    onUpdateWord(wordBook.id, editingWordId, {
      english: editingWord.english.trim(),
      korean: editingWord.korean.trim()
    });

    setEditingWordId(null);
    setEditingWord({ english: '', korean: '' });
  };

  // 수정 취소
  const cancelEdit = () => {
    setEditingWordId(null);
    setEditingWord({ english: '', korean: '' });
  };

  // 한글 해석 가리기/보기
  const toggleKoreanVisibility = (wordId) => {
    const newHiddenKorean = new Set(hiddenKorean);
    if (newHiddenKorean.has(wordId)) {
      newHiddenKorean.delete(wordId);
    } else {
      newHiddenKorean.add(wordId);
    }
    setHiddenKorean(newHiddenKorean);
  };

  // 영어 단어 가리기/보기
  const toggleEnglishVisibility = (wordId) => {
    const newHiddenEnglish = new Set(hiddenEnglish);
    if (newHiddenEnglish.has(wordId)) {
      newHiddenEnglish.delete(wordId);
    } else {
      newHiddenEnglish.add(wordId);
    }
    setHiddenEnglish(newHiddenEnglish);
  };

  // 모든 한글 해석 가리기/보기
  const toggleAllKoreanVisibility = () => {
    if (hiddenKorean.size === wordBook.words.length) {
      setHiddenKorean(new Set());
    } else {
      setHiddenKorean(new Set(wordBook.words.map(word => word.id)));
    }
  };

  // 모든 영어 단어 가리기/보기
  const toggleAllEnglishVisibility = () => {
    if (hiddenEnglish.size === wordBook.words.length) {
      setHiddenEnglish(new Set());
    } else {
      setHiddenEnglish(new Set(wordBook.words.map(word => word.id)));
    }
  };

  // 단어 외움 체크/해제
  const toggleMemorized = (wordId) => {
    const newMemorizedWords = new Set(memorizedWords);
    if (newMemorizedWords.has(wordId)) {
      newMemorizedWords.delete(wordId);
    } else {
      newMemorizedWords.add(wordId);
    }
    setMemorizedWords(newMemorizedWords);
  };

  return (
    <div>
      {/* 단어장 헤더 */}
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#333', marginBottom: '8px' }}>
            📖 {wordBook.title}
          </h2>
          {wordBook.description && (
            <p style={{ color: '#666', fontSize: '16px' }}>
              {wordBook.description}
            </p>
          )}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            gap: '8px',
            marginTop: '12px',
            color: '#888',
            fontSize: '14px'
          }}>
            <Book size={16} />
            총 {wordBook.words.length}개의 단어
          </div>
        </div>

        {/* 단어 추가 버튼 */}
        {!showAddForm && (
          <div style={{ textAlign: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={18} />
              새 단어 추가
            </button>
          </div>
        )}

        {/* 단어 추가 폼 */}
        {showAddForm && (
          <form onSubmit={handleAddWord} style={{ marginTop: '20px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>영어 단어 *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="예) apple, beautiful..."
                  value={newWord.english}
                  onChange={(e) => setNewWord({...newWord, english: e.target.value})}
                  autoFocus
                />
              </div>
              
              <div className="form-group" style={{ margin: 0 }}>
                <label>한글 뜻 *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="예) 사과, 아름다운..."
                  value={newWord.korean}
                  onChange={(e) => setNewWord({...newWord, korean: e.target.value})}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button type="submit" className="btn btn-primary btn-small">
                <Save size={16} />
                추가
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-small"
                onClick={cancelAdd}
              >
                <X size={16} />
                취소
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 단어 목록 */}
      {wordBook.words.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <Book size={48} style={{ color: '#ccc', marginBottom: '16px' }} />
          <h3 style={{ color: '#666', marginBottom: '8px' }}>
            아직 단어가 없습니다
          </h3>
          <p style={{ color: '#999' }}>
            첫 번째 단어를 추가해보세요!
          </p>
        </div>
      ) : (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ 
              color: 'white', 
              margin: 0,
              flex: 1,
              textAlign: 'center'
            }}>
              단어 목록 
              <span style={{ fontSize: '14px', opacity: '0.8' }}>
                (외움: {memorizedWords.size}/{wordBook.words.length})
              </span>
            </h3>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-secondary btn-small"
                onClick={toggleAllEnglishVisibility}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontSize: '11px',
                  padding: '4px 8px'
                }}
                title={hiddenEnglish.size === wordBook.words.length ? '모든 영어 보기' : '모든 영어 가리기'}
              >
                {hiddenEnglish.size === wordBook.words.length ? (
                  <>
                    <Eye size={10} />
                    영어
                  </>
                ) : (
                  <>
                    <EyeOff size={10} />
                    영어
                  </>
                )}
              </button>
              
              <button
                className="btn btn-secondary btn-small"
                onClick={toggleAllKoreanVisibility}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontSize: '11px',
                  padding: '4px 8px'
                }}
                title={hiddenKorean.size === wordBook.words.length ? '모든 해석 보기' : '모든 해석 가리기'}
              >
                {hiddenKorean.size === wordBook.words.length ? (
                  <>
                    <Eye size={10} />
                    한글
                  </>
                ) : (
                  <>
                    <EyeOff size={10} />
                    한글
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div 
            className="word-grid"
            style={{ 
              display: 'grid', 
              gap: '12px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))'
            }}
          >
            {[...wordBook.words]
              .reverse()
              .sort((a, b) => {
                // 외운 단어는 아래로, 안 외운 단어는 위로
                const aMemorized = memorizedWords.has(a.id);
                const bMemorized = memorizedWords.has(b.id);
                if (aMemorized && !bMemorized) return 1;
                if (!aMemorized && bMemorized) return -1;
                return 0;
              })
              .map((word, index) => (
                              <div 
                  key={word.id} 
                  className="card"
                  style={{
                    opacity: memorizedWords.has(word.id) ? 0.6 : 1,
                    order: memorizedWords.has(word.id) ? 1 : 0
                  }}
                >
                {editingWordId === word.id ? (
                  // 수정 모드
                  <form onSubmit={handleUpdateWord}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="영어 단어"
                        value={editingWord.english}
                        onChange={(e) => setEditingWord({...editingWord, english: e.target.value})}
                        autoFocus
                        style={{ fontSize: '16px' }}
                      />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="한글 뜻"
                        value={editingWord.korean}
                        onChange={(e) => setEditingWord({...editingWord, korean: e.target.value})}
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button type="submit" className="btn btn-primary btn-small">
                        <Save size={14} />
                        저장
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-small"
                        onClick={cancelEdit}
                      >
                        <X size={14} />
                        취소
                      </button>
                    </div>
                  </form>
                ) : (
                  // 일반 모드
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div 
                      className="word-item"
                      style={{ 
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      {hiddenEnglish.has(word.id) ? (
                        <strong style={{ 
                          fontSize: '18px',
                          color: '#999',
                          fontStyle: 'italic',
                          fontWeight: '400',
                          minWidth: 'fit-content'
                        }}>
                          ???
                        </strong>
                      ) : (
                        <strong style={{ 
                          fontSize: '18px',
                          color: memorizedWords.has(word.id) ? '#999' : '#333',
                          minWidth: 'fit-content',
                          textDecoration: memorizedWords.has(word.id) ? 'line-through' : 'none'
                        }}>
                          {word.english}
                        </strong>
                      )}
                      
                      {hiddenKorean.has(word.id) ? (
                        <span style={{ 
                          fontSize: '16px',
                          color: '#999',
                          fontStyle: 'italic',
                          fontWeight: '400'
                        }}>
                          ???
                        </span>
                      ) : (
                        <span style={{ 
                          fontSize: '16px',
                          color: memorizedWords.has(word.id) ? '#999' : '#667eea',
                          fontWeight: '500',
                          textDecoration: memorizedWords.has(word.id) ? 'line-through' : 'none'
                        }}>
                          {word.korean}
                        </span>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
                      <button
                        className="btn btn-small"
                        onClick={() => toggleMemorized(word.id)}
                        style={{ 
                          background: memorizedWords.has(word.id) ? '#2ed573' : '#ddd',
                          color: memorizedWords.has(word.id) ? 'white' : '#666',
                          border: 'none',
                          minWidth: '28px',
                          fontSize: '10px',
                          padding: '4px'
                        }}
                        title={memorizedWords.has(word.id) ? '외움 해제' : '외움 체크'}
                      >
                        <Check size={10} />
                      </button>
                      
                      <button
                        className="btn btn-small"
                        onClick={() => toggleEnglishVisibility(word.id)}
                        style={{ 
                          background: hiddenEnglish.has(word.id) ? '#2ed573' : '#ffa502',
                          color: 'white',
                          border: 'none',
                          minWidth: '28px',
                          fontSize: '10px',
                          padding: '4px'
                        }}
                        title={hiddenEnglish.has(word.id) ? '영어 보기' : '영어 가리기'}
                      >
                        {hiddenEnglish.has(word.id) ? <Eye size={10} /> : <EyeOff size={10} />}
                      </button>
                      
                      <button
                        className="btn btn-small"
                        onClick={() => toggleKoreanVisibility(word.id)}
                        style={{ 
                          background: hiddenKorean.has(word.id) ? '#2ed573' : '#ffa502',
                          color: 'white',
                          border: 'none',
                          minWidth: '28px',
                          fontSize: '10px',
                          padding: '4px'
                        }}
                        title={hiddenKorean.has(word.id) ? '한글 보기' : '한글 가리기'}
                      >
                        {hiddenKorean.has(word.id) ? <Eye size={10} /> : <EyeOff size={10} />}
                      </button>
                      
                      <button
                        className="btn btn-small"
                        onClick={() => startEdit(word)}
                        style={{ 
                          background: '#3742fa',
                          color: 'white',
                          border: 'none',
                          minWidth: '28px',
                          fontSize: '10px',
                          padding: '4px'
                        }}
                        title="단어 수정"
                      >
                        <Edit3 size={10} />
                      </button>
                      
                      <button
                        className="btn btn-small"
                        onClick={() => {
                          if (window.confirm('이 단어를 삭제하시겠습니까?')) {
                            onDeleteWord(wordBook.id, word.id);
                          }
                        }}
                        style={{ 
                          background: '#ff4757',
                          color: 'white',
                          border: 'none',
                          minWidth: '28px',
                          fontSize: '10px',
                          padding: '4px'
                        }}
                        title="단어 삭제"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WordBookDetail; 