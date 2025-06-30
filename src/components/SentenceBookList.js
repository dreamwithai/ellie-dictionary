import React, { useState } from 'react';
import { Book, Eye, Trash2, Calendar } from 'lucide-react';

function SentenceBookList({ sentenceBooks, setSentenceBooks, onView, hideAddButton }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSentenceBooks([
      ...sentenceBooks,
      { id: Date.now(), title: title.trim(), description: description.trim(), sentences: [] }
    ]);
    setTitle('');
    setDescription('');
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('정말로 삭제하시겠습니까?')) {
      setSentenceBooks(sentenceBooks.filter(b => b.id !== id));
    }
  };

  // 날짜 포맷 함수 (WordBookList와 동일)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  if (sentenceBooks.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
        <div style={{ fontSize: '4.2em', fontWeight: 900, color: '#13204e', marginBottom: '36px', letterSpacing: '-2px', lineHeight: 1 }}>텅</div>
        <h3 style={{ marginBottom: '10px', color: '#666' }}>아직 문장북이 없습니다</h3>
        <p style={{ color: '#999', whiteSpace: 'pre-line' }}>
          새 문장북을 만들어서
          {'\n'}문장 암기를 시작해보세요!
          <br />
          <strong style={{ color: '#13204e', display: 'block', marginTop: 18, fontWeight: 700, fontSize: '1.1em' }}>YOU CAN DO IT !!</strong>
        </p>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '20px' }}>
      <h2 style={{ marginTop: 0, marginBottom: '30px', color: '#13204e', textAlign: 'center', fontWeight: 800 }}>
        내 문장북 목록 ({sentenceBooks.length}개)
      </h2>
      {!hideAddButton && (
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ marginBottom: 16 }}>
          + 문장북 추가
        </button>
      )}
      {showForm && !hideAddButton && (
        <form onSubmit={handleAdd} style={{ marginBottom: 24 }}>
          <input
            type="text"
            placeholder="문장북 제목"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="form-control"
            style={{ marginBottom: 8 }}
            autoFocus
          />
          <input
            type="text"
            placeholder="설명 (선택)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="form-control"
            style={{ marginBottom: 8 }}
          />
          <button type="submit" className="btn btn-primary btn-small">저장</button>
        </form>
      )}
      {sentenceBooks.map(book => (
        <div key={book.id} className="card">
          {/* 상단: 제목, 설명, 버튼 영역 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '12px'
          }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.4em', marginBottom: '8px', color: '#333', fontWeight: '600' }}>{book.title}</h3>
              {book.description && (
                <p style={{ color: '#666', marginBottom: '0', lineHeight: '1.5' }}>{book.description}</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
              <button
                className="btn btn-small btn-mint"
                onClick={() => onView(book)}
                title="문장북 보기"
              >
                <Eye size={16} />
                보기
              </button>
              <button
                className="btn btn-small btn-coral"
                onClick={() => {
                  if (window.confirm('정말로 이 문장북을 삭제하시겠습니까?')) {
                    setSentenceBooks(sentenceBooks.filter(b => b.id !== book.id));
                  }
                }}
                title="문장북 삭제"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          {/* 하단: 문장 개수와 날짜 정보 */}
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
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', minWidth: '0', flexShrink: 1, whiteSpace: 'nowrap' }}>
              <Book size={14} />
              <span>{book.sentences ? book.sentences.length : 0}개 문장</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0, whiteSpace: 'nowrap' }}>
              <Calendar size={14} />
              <span>{formatDate(book.createdAt)}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SentenceBookList; 