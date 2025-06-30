import React, { useState } from 'react';
import { Check, Star, StarOff, Eye, EyeOff, Edit3, Trash2 } from 'lucide-react';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

function SentenceBookDetail({ sentenceBook, setSentenceBooks, sentenceBooks, onBack }) {
  const [speaker, setSpeaker] = useState('');
  const [english, setEnglish] = useState('');
  const [korean, setKorean] = useState('');
  const [blanks, setBlanks] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editSpeaker, setEditSpeaker] = useState('');
  const [editEnglish, setEditEnglish] = useState('');
  const [editKorean, setEditKorean] = useState('');
  const [editBlanks, setEditBlanks] = useState('');
  const [hiddenEnglish, setHiddenEnglish] = useState(new Set());
  const [hiddenKorean, setHiddenKorean] = useState(new Set());
  const [memorized, setMemorized] = useState(new Set());
  const [important, setImportant] = useState(new Set());
  const [blankMode, setBlankMode] = useState(new Set());
  const [globalBlankMode, setGlobalBlankMode] = useState(false);

  // 1. 사용할 색상 팔레트 (원하는 만큼 추가 가능)
  const speakerColors = [
    { background: '#ede7f6', color: '#6c63ff' }, // 보라
    { background: '#e0f7fa', color: '#0097a7' }, // 민트
    { background: '#fff9c4', color: '#fbc02d' }, // 노랑
    { background: '#ffe0e0', color: '#e57373' }, // 연핑크
    { background: '#e0f2f1', color: '#00796b' }, // 청록
  ];
  // 2. 화자별 색상 매핑을 위한 Map (컴포넌트 렌더링마다 초기화 방지)
  const speakerColorMap = React.useRef({});
  let colorIndex = React.useRef(0);
  // 3. 화자별 색상 반환 함수
  function getSpeakerStyle(speaker) {
    if (!speaker) return {};
    if (!speakerColorMap.current[speaker]) {
      speakerColorMap.current[speaker] = speakerColors[colorIndex.current % speakerColors.length];
      colorIndex.current++;
    }
    return speakerColorMap.current[speaker];
  }

  const handleAdd = (e) => {
    e.preventDefault();
    if (!english.trim() || !korean.trim()) return;
    
    // blanks 입력 처리 (예: "0,2,4" 또는 "0 2 4")
    const blanksArray = blanks.trim() 
      ? blanks.split(/[,\s]+/).map(num => parseInt(num.trim())).filter(num => !isNaN(num))
      : [];
    
    const updatedBooks = sentenceBooks.map(book =>
      book.id === sentenceBook.id
        ? { 
            ...book, 
            sentences: [...(book.sentences || []), { 
              id: Date.now(), 
              speaker: speaker.trim(), 
              english: english.trim(), 
              korean: korean.trim(),
              blanks: blanksArray
            }] 
          }
        : book
    );
    setSentenceBooks(updatedBooks);
    setSpeaker('');
    setEnglish('');
    setKorean('');
    setBlanks('');
  };

  const handleDelete = (id) => {
    const updatedBooks = sentenceBooks.map(book =>
      book.id === sentenceBook.id
        ? { ...book, sentences: book.sentences.filter(s => s.id !== id) }
        : book
    );
    setSentenceBooks(updatedBooks);
    setMemorized(prev => { const s = new Set(prev); s.delete(id); return s; });
    setImportant(prev => { const s = new Set(prev); s.delete(id); return s; });
    setHiddenEnglish(prev => { const s = new Set(prev); s.delete(id); return s; });
    setHiddenKorean(prev => { const s = new Set(prev); s.delete(id); return s; });
    setBlankMode(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const handleEdit = (sentence) => {
    setEditingId(sentence.id);
    setEditSpeaker(sentence.speaker || '');
    setEditEnglish(sentence.english);
    setEditKorean(sentence.korean);
    setEditBlanks((sentence.blanks || []).join(', '));
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    
    // blanks 입력 처리
    const blanksArray = editBlanks.trim() 
      ? editBlanks.split(/[,\s]+/).map(num => parseInt(num.trim())).filter(num => !isNaN(num))
      : [];
    
    const updatedBooks = sentenceBooks.map(book =>
      book.id === sentenceBook.id
        ? { 
            ...book, 
            sentences: book.sentences.map(s =>
              s.id === editingId 
                ? { ...s, speaker: editSpeaker, english: editEnglish, korean: editKorean, blanks: blanksArray }
                : s
            ) 
          }
        : book
    );
    setSentenceBooks(updatedBooks);
    setEditingId(null);
    setEditSpeaker('');
    setEditEnglish('');
    setEditKorean('');
    setEditBlanks('');
  };

  // 중요 버튼 - blanks 배열이 있는 단어들을 빈칸으로 변환
  const toggleImportant = (sentenceId) => {
    if (blankMode.has(sentenceId)) {
      // 빈칸 모드 해제
      setBlankMode(prev => { const s = new Set(prev); s.delete(sentenceId); return s; });
    } else {
      // 빈칸 모드 활성화 (blanks 배열이 있고 비어있지 않을 때만)
      const sentence = currentBook.sentences?.find(s => s.id === sentenceId);
      if (sentence && sentence.blanks && sentence.blanks.length > 0) {
        setBlankMode(prev => { const s = new Set(prev); s.add(sentenceId); return s; });
        setImportant(prev => { const s = new Set(prev); s.add(sentenceId); return s; });
      }
    }
  };

  // 전체 빈칸 모드 토글
  const toggleGlobalBlankMode = () => {
    setGlobalBlankMode(!globalBlankMode);
  };

  // 문장 렌더링 (blanks 배열 기반)
  const renderSentence = (sentence) => {
    const isBlankModeActive = globalBlankMode || blankMode.has(sentence.id);
    const words = sentence.english.split(/\s+/).filter(word => word.length > 0);
    const blanksArray = sentence.blanks || [];

    return (
      <div style={{ fontWeight: 'bold', color: '#13204e', marginBottom: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {sentence.speaker && (
          <span
            style={{
              display: 'inline-block',
              fontSize: 12,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 8,
              marginRight: 8,
              verticalAlign: 'middle',
              letterSpacing: 0.5,
              ...getSpeakerStyle(sentence.speaker)
            }}
          >
            {sentence.speaker}
          </span>
        )}
        {words.map((word, wordIndex) => {
          const isBlankWord = blanksArray.includes(wordIndex);
          if (isBlankModeActive && isBlankWord) {
            // 빈칸 모드: 언더라인 1줄만 (텍스트 없이 border-bottom만)
            return (
              <span key={wordIndex} style={{
                borderBottom: '2px solid #6c63ff',
                minWidth: '40px',
                display: 'inline-block',
                height: '1.2em',
                marginRight: '2px',
                verticalAlign: 'bottom'
              }}>
                {wordIndex < words.length - 1 ? '\u00A0' : ''}
              </span>
            );
          } else if (!isBlankModeActive && isBlankWord) {
            // 일반 모드: 노란색 배경 하이라이트
            return (
              <span key={wordIndex} style={{
                background: '#fff3cd',
                color: '#13204e',
                padding: '2px 4px',
                borderRadius: '4px',
                fontWeight: 'bold',
                marginRight: '2px',
                transition: 'all 0.2s'
              }}>
                {word}{wordIndex < words.length - 1 ? ' ' : ''}
              </span>
            );
          } else {
            // 일반 단어
            return <span key={wordIndex}>{word}{wordIndex < words.length - 1 ? ' ' : ''}</span>;
          }
        })}
      </div>
    );
  };

  // 최신 데이터 반영
  const currentBook = sentenceBooks.find(b => b.id === sentenceBook.id) || sentenceBook;

  // 상태 토글 함수들
  const toggleMemorized = (id) => {
    setMemorized(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };
  const toggleHiddenEnglish = (id) => {
    setHiddenEnglish(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };
  const toggleHiddenKorean = (id) => {
    setHiddenKorean(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  return (
    <div className="card" style={{ maxWidth: 480, margin: '32px auto', padding: 24 }}>
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: 16 }}>← 문장북 목록</button>
      <h2 style={{ marginBottom: 8 }}>{currentBook.title}</h2>
      {currentBook.description && <div style={{ color: '#666', marginBottom: 16 }}>{currentBook.description}</div>}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="화자 (예: Mom, Tom, ... 선택사항)"
          value={speaker}
          onChange={e => setSpeaker(e.target.value)}
          className="form-control"
          style={{ flex: 1, minWidth: 80 }}
        />
        <input
          type="text"
          placeholder="영어 문장"
          value={english}
          onChange={e => setEnglish(e.target.value)}
          className="form-control"
          style={{ flex: 2, minWidth: 120 }}
        />
        <input
          type="text"
          placeholder="한글 해석"
          value={korean}
          onChange={e => setKorean(e.target.value)}
          className="form-control"
          style={{ flex: 2, minWidth: 120 }}
        />
        <input
          type="text"
          placeholder="빈칸 단어 인덱스 (예: 0,2,4)"
          value={blanks}
          onChange={e => setBlanks(e.target.value)}
          className="form-control"
          style={{ flex: 1, minWidth: 80 }}
        />
        <button type="submit" className="btn btn-primary">추가</button>
      </form>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button
          className={`btn btn-small ${globalBlankMode ? 'btn-primary' : 'btn-secondary'}`}
          onClick={toggleGlobalBlankMode}
          style={{ minWidth: 120 }}
        >
          {globalBlankMode ? '전체 blank 숨기기' : '전체 blank 보이기'}
        </button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {(!currentBook.sentences || currentBook.sentences.length === 0) && <li style={{ color: '#888' }}>아직 문장이 없습니다.</li>}
        {currentBook.sentences && currentBook.sentences.map((sentence, idx) => (
          <li key={sentence.id} className="card" style={{ marginBottom: 16, padding: 16, background: memorized.has(sentence.id) ? '#f0f9f0' : '#fff', border: '1px solid #eee', position: 'relative' }}>
            {editingId === sentence.id ? (
              <form onSubmit={handleEditSave} style={{ marginBottom: 8 }}>
                <input
                  type="text"
                  placeholder="화자"
                  value={editSpeaker}
                  onChange={e => setEditSpeaker(e.target.value)}
                  className="form-control"
                  style={{ marginBottom: 6 }}
                />
                <textarea
                  placeholder="영어 문장"
                  value={editEnglish}
                  onChange={e => setEditEnglish(e.target.value)}
                  className="form-control"
                  style={{ marginBottom: 6, whiteSpace: 'pre-wrap' }}
                  rows={2}
                />
                <textarea
                  placeholder="한글 해석"
                  value={editKorean}
                  onChange={e => setEditKorean(e.target.value)}
                  className="form-control"
                  style={{ marginBottom: 6, whiteSpace: 'pre-wrap' }}
                  rows={2}
                />
                <input
                  type="text"
                  placeholder="빈칸 단어 인덱스 (예: 0,2,4)"
                  value={editBlanks}
                  onChange={e => setEditBlanks(e.target.value)}
                  className="form-control"
                  style={{ marginBottom: 6 }}
                />
                <button type="submit" className="btn btn-primary btn-small" style={{ marginRight: 8 }}>저장</button>
                <button type="button" className="btn btn-secondary btn-small" onClick={() => setEditingId(null)}>취소</button>
              </form>
            ) : (
              <>
                {renderSentence(sentence)}
                <div style={{ color: '#666', marginBottom: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {sentence.korean}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <button className="btn btn-mint btn-small" onClick={() => toggleMemorized(sentence.id)} title="암기 체크">
                    <Check size={18} style={{ color: memorized.has(sentence.id) ? '#4CAF50' : '#bbb' }} />
                  </button>
                  <button
                    onClick={() => toggleImportant(sentence.id)}
                    style={{
                      background: 'none',
                      boxShadow: 'none',
                      minWidth: 0,
                      padding: 6,
                      color: important.has(sentence.id) ? '#ff9800' : '#b39ddb',
                      borderRadius: '50%',
                      margin: '0 2px',
                      border: 'none',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                    title="필수 암기 문장 표시"
                  >
                    <PriorityHighIcon style={{ fontSize: 24 }} />
                  </button>
                  <button className="btn btn-secondary btn-small" onClick={() => handleEdit(sentence)} title="수정">
                    <Edit3 size={16} />
                  </button>
                  <button className="btn btn-danger btn-small" onClick={() => handleDelete(sentence.id)} title="삭제">
                    <Trash2 size={16} />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SentenceBookDetail; 