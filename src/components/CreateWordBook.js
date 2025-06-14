import React, { useState, useRef } from 'react';
import { Save, X, Home } from 'lucide-react';

function CreateWordBook({ onCreateWordBook, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const titleInputRef = useRef(null);

  // 모바일 키보드 대응: 포커스 시 input이 화면 중앙에 오도록 스크롤
  const handleTitleFocus = () => {
    if (window.innerWidth <= 600 && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200); // 키보드가 올라오는 시간 고려
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (title.trim() === '') {
      alert('단어장 제목을 입력해주세요!');
      return;
    }

    onCreateWordBook({
      title: title.trim(),
      description: description.trim()
    });
  };

  return (
    <div className="card">
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', textAlign: 'center', margin: 0 }}>
          ✨ 새 단어장 만들기
        </h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">단어장 제목 *</label>
          <input
            type="text"
            id="title"
            className="form-control"
            placeholder="예) 중학교 2학년 영어, 토익 기초 단어..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={50}
            ref={titleInputRef}
            onFocus={handleTitleFocus}
          />
          <small style={{ color: '#888', fontSize: '14px' }}>
            {title.length}/50자
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="description">설명 (선택사항)</label>
          <textarea
            id="description"
            className="form-control"
            placeholder="이 단어장에 대한 간단한 설명을 써주세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={200}
            style={{ resize: 'vertical', minHeight: '80px' }}
          />
          <small style={{ color: '#888', fontSize: '14px' }}>
            {description.length}/200자
          </small>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'center',
          marginTop: '32px'
        }}>
          <button
            type="submit"
            className="btn btn-mint"
            disabled={title.trim() === ''}
          >
            <Save size={18} />
            단어장 만들기
          </button>
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            <X size={18} />
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateWordBook; 