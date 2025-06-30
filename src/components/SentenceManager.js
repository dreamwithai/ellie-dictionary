import React, { useState } from 'react';

function SentenceManager({ sentences, setSentences, onBack }) {
  const [english, setEnglish] = useState('');
  const [korean, setKorean] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!english.trim() || !korean.trim()) return;
    setSentences([
      ...sentences,
      { id: Date.now(), english: english.trim(), korean: korean.trim() }
    ]);
    setEnglish('');
    setKorean('');
  };

  const handleDelete = (id) => {
    setSentences(sentences.filter(s => s.id !== id));
  };

  return (
    <div className="card" style={{ maxWidth: 480, margin: '32px auto', padding: 24 }}>
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: 16 }}>← 뒤로가기</button>
      <h2 style={{ marginBottom: 16 }}>문장 관리</h2>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input
          type="text"
          placeholder="영어 문장"
          value={english}
          onChange={e => setEnglish(e.target.value)}
          className="form-control"
          style={{ flex: 1 }}
        />
        <input
          type="text"
          placeholder="한글 해석"
          value={korean}
          onChange={e => setKorean(e.target.value)}
          className="form-control"
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary">추가</button>
      </form>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {sentences.length === 0 && <li style={{ color: '#888' }}>아직 등록된 문장이 없습니다.</li>}
        {sentences.map(sentence => (
          <li key={sentence.id} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
            <div style={{ fontWeight: 'bold', color: '#13204e' }}>{sentence.english}</div>
            <div style={{ color: '#666', marginBottom: 4 }}>{sentence.korean}</div>
            <button className="btn btn-danger btn-small" onClick={() => handleDelete(sentence.id)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SentenceManager; 