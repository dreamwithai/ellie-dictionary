import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, X, RotateCcw } from 'lucide-react';

function SentenceTest({ sentenceBooks, onBack }) {
  const [testStep, setTestStep] = useState('setup'); // 'setup', 'testing', 'result'
  const [selectedSentenceBooks, setSelectedSentenceBooks] = useState(new Set());
  const [testSentences, setTestSentences] = useState([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [testBlankMode, setTestBlankMode] = useState('essential'); // 'essential' | 'all'
  const inputRefs = useRef([]);

  // 문장북 선택/해제
  const toggleSentenceBook = (bookId) => {
    setSelectedSentenceBooks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookId)) {
        newSet.delete(bookId);
      } else {
        newSet.add(bookId);
      }
      return newSet;
    });
  };

  // 테스트 시작
  const startTest = () => {
    // 선택된 문장북에서 문장만 모으기
    let allSentences = sentenceBooks
      .filter(book => selectedSentenceBooks.has(book.id))
      .flatMap(book => (book.sentences || []).map(s => ({ ...s, bookTitle: book.title })));
    // blanks가 있는 문장만 (필수 모드) 또는 전체 문장 (전체 모드)
    if (testBlankMode === 'essential') {
      allSentences = allSentences.filter(sentence => sentence.blanks && sentence.blanks.length > 0);
    } else {
      // 전체 단어 빈칸: blanks를 모든 단어 인덱스로 덮어씀
      allSentences = allSentences.filter(sentence => sentence.english && sentence.english.trim().length > 0)
        .map(sentence => {
          const wordCount = sentence.english.split(/\s+/).filter(w => w.length > 0).length;
          return {
            ...sentence,
            blanks: Array.from({ length: wordCount }, (_, i) => i)
          };
        });
    }
    if (allSentences.length === 0) {
      alert('선택한 문장북에 테스트할 문장이 없습니다!');
      return;
    }
    // 랜덤 섞기
    const shuffled = [...allSentences].sort(() => Math.random() - 0.5);
    setTestSentences(shuffled);
    setCurrentSentenceIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setScore(0);
    setTotalQuestions(shuffled.length);
    setTestStep('testing');
  };

  // 테스트 재시작
  const restartTest = () => {
    setTestStep('setup');
    setSelectedSentenceBooks(new Set());
    setTestSentences([]);
    setCurrentSentenceIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setScore(0);
    setTotalQuestions(0);
  };

  // 기존 testableSentences, currentSentence 등은 testStep === 'testing'일 때만 사용
  const currentSentence = testStep === 'testing' ? testSentences[currentSentenceIndex] : null;
  const blanksArray = currentSentence?.blanks || [];
  const words = currentSentence?.english.split(/\s+/).filter(word => word.length > 0) || [];

  const handleAnswerInput = (wordIndex, value) => {
    setUserAnswers(prev => {
      const newAnswers = { ...prev, [wordIndex]: value };
      // 정답 체크 후 다음 blank로 이동
      const correctWord = words[wordIndex] || '';
      if (
        value.trim() !== '' &&
        value.trim().toLowerCase() === correctWord.toLowerCase()
      ) {
        // 현재 blank가 blanksArray 중 몇 번째인지 찾기
        const currentBlankIdx = blanksArray.indexOf(wordIndex);
        if (currentBlankIdx !== -1 && currentBlankIdx < blanksArray.length - 1) {
          // 다음 blank의 wordIndex
          const nextBlankWordIndex = blanksArray[currentBlankIdx + 1];
          // 다음 input에 focus
          setTimeout(() => {
            if (inputRefs.current[nextBlankWordIndex]) {
              inputRefs.current[nextBlankWordIndex].focus();
            }
          }, 0);
        }
      }
      return newAnswers;
    });
  };

  const checkAnswer = () => {
    if (!currentSentence) return;

    let correctCount = 0;

    blanksArray.forEach(wordIndex => {
      const userAnswer = userAnswers[wordIndex] || '';
      const correctWord = words[wordIndex] || '';
      
      if (
        userAnswer.trim() !== '' &&
        userAnswer.toLowerCase() === correctWord.toLowerCase()
      ) {
        correctCount++;
      }
    });

    const newScore = score + correctCount;
    setScore(newScore);
    setShowResults(true);
  };

  const nextSentence = () => {
    if (currentSentenceIndex < testSentences.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
      setUserAnswers({});
      setShowResults(false);
    }
  };

  const renderSentence = () => {
    if (!currentSentence) return null;
    if (!showResults) {
      // 문제 푸는 중: blank는 input(보라색 언더라인)
      return (
        <div style={{ fontWeight: 'bold', color: '#13204e', marginBottom: 16, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {currentSentence.speaker && <span style={{ color: '#6c63ff', marginRight: 8 }}>{currentSentence.speaker}:</span>}
          {words.map((word, wordIndex) => {
            if (blanksArray.includes(wordIndex)) {
              const userAnswer = userAnswers[wordIndex] || '';
              return (
                <span key={wordIndex}>
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => handleAnswerInput(wordIndex, e.target.value)}
                    ref={el => (inputRefs.current[wordIndex] = el)}
                    style={{
                      border: 'none',
                      borderBottom: '2px solid #6c63ff',
                      background: 'transparent',
                      color: '#13204e',
                      fontWeight: 'bold',
                      width: Math.max(word.length * 8, 40),
                      textAlign: 'center',
                      outline: 'none',
                      marginRight: '2px',
                    }}
                    placeholder=""
                  />
                  {wordIndex < words.length - 1 ? ' ' : ''}
                </span>
              );
            }
            return <span key={wordIndex}>{word}{wordIndex < words.length - 1 ? ' ' : ''}</span>;
          })}
        </div>
      );
    } else {
      // 정답 확인: blank는 맞으면 초록, 틀리면 빨강 언더라인, 입력한 값 그대로(없으면 &nbsp;)
      return (
        <div style={{ fontWeight: 'bold', color: '#13204e', marginBottom: 16, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {currentSentence.speaker && <span style={{ color: '#6c63ff', marginRight: 8 }}>{currentSentence.speaker}:</span>}
          {words.map((word, wordIndex) => {
            if (blanksArray.includes(wordIndex)) {
              const userAnswer = userAnswers[wordIndex] || '';
              const correctWord = word;
              const isCorrect = userAnswer.trim() !== '' && userAnswer.toLowerCase() === correctWord.toLowerCase();
              return (
                <span key={wordIndex} style={{
                  borderBottom: `2px solid ${isCorrect ? '#4CAF50' : '#ff6b6b'}`,
                  minWidth: '40px',
                  display: 'inline-block',
                  height: '1.2em',
                  marginRight: '2px',
                  verticalAlign: 'bottom',
                  fontWeight: 'bold',
                  color: isCorrect ? '#4CAF50' : '#ff6b6b',
                  textAlign: 'center',
                  textDecoration: 'none', // underline 중복 방지
                }}>
                  {userAnswer !== '' ? userAnswer : '\u00A0'}
                  {wordIndex < words.length - 1 ? ' ' : ''}
                </span>
              );
            }
            return <span key={wordIndex}>{word}{wordIndex < words.length - 1 ? ' ' : ''}</span>;
          })}
        </div>
      );
    }
  };

  const isAllCorrect = blanksArray.every(wordIndex => {
    const userAnswer = userAnswers[wordIndex] || '';
    const correctWord = words[wordIndex];
    return userAnswer.trim() !== '' && userAnswer.toLowerCase() === correctWord.toLowerCase();
  });

  // setup 단계: 문장북 선택 + 모드 선택 화면 (하단 fixed bar)
  if (testStep === 'setup') {
    return (
      <>
        <div className="card" style={{ maxWidth: 480, margin: '32px auto', padding: 24, paddingBottom: 90 }}>
          <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: 16 }}>← 홈으로</button>
          <h2 style={{ textAlign: 'center', marginBottom: 24 }}>문장 테스트</h2>
          <h3 style={{ color: '#333', marginBottom: 16 }}>테스트할 문장북 선택</h3>
          <div style={{ display: 'grid', gap: '10px', marginBottom: 24 }}>
            {sentenceBooks.map(book => (
              <div
                key={book.id}
                onClick={() => toggleSentenceBook(book.id)}
                style={{
                  padding: '12px 16px',
                  border: `1px solid ${selectedSentenceBooks.has(book.id) ? '#B39DDB' : '#e1e5e9'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backgroundColor: selectedSentenceBooks.has(book.id) ? '#f0f2ff' : 'white',
                  transition: 'all 0.3s ease',
                  fontWeight: selectedSentenceBooks.has(book.id) ? 700 : 400
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#333', fontWeight: 700, fontSize: '16px', marginBottom: '2px' }}>
                      {book.title} <span style={{ color: '#888', fontWeight: 400, fontSize: '14px' }}>({book.sentences?.length || 0}개 문장)</span>
                    </div>
                    {book.description && (
                      <div style={{ fontSize: '13px', color: '#888', marginTop: '0px', whiteSpace: 'pre-line', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {book.description}
                      </div>
                    )}
                  </div>
                  {selectedSentenceBooks.has(book.id) && (
                    <Check size={20} style={{ color: '#B39DDB' }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* 하단 고정 바 */}
        <div style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 200,
          background: 'rgba(255,255,255,0.98)',
          boxShadow: '0 -2px 16px rgba(55,65,81,0.08)',
          padding: '14px 0 14px 0',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          gap: 10,
          width: '100vw',
          maxWidth: '100vw',
        }}>
          <button
            onClick={() => setTestBlankMode('essential')}
            className={`btn btn-small ${testBlankMode === 'essential' ? 'btn-lavender' : 'btn-lavender-outline'}`}
            style={{ minWidth: 120, fontWeight: 700 }}
          >
            필수 단어만 빈칸
          </button>
          <button
            onClick={() => setTestBlankMode('all')}
            className={`btn btn-small ${testBlankMode === 'all' ? 'btn-lavender' : 'btn-lavender-outline'}`}
            style={{ minWidth: 120, fontWeight: 700 }}
          >
            전체 단어 빈칸
          </button>
          <button
            className="btn btn-mint btn-small"
            onClick={startTest}
            disabled={selectedSentenceBooks.size === 0}
            style={{ minWidth: 120, fontWeight: 700 }}
          >
            테스트 시작
          </button>
        </div>
      </>
    );
  }

  if (testSentences.length === 0) {
    return (
      <div className="card" style={{ maxWidth: 480, margin: '32px auto', padding: 24 }}>
        <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: 16 }}>← 홈으로</button>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h3 style={{ color: '#666', marginBottom: 16 }}>테스트할 문장이 없습니다</h3>
          <p style={{ color: '#888', marginBottom: 24 }}>
            빈칸이 설정된 문장이 있어야 테스트를 할 수 있어요.
          </p>
          <p style={{ color: '#666', fontSize: '14px' }}>
            문장북에서 문장을 추가할 때 "빈칸 단어 인덱스"를 설정해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 480, margin: '32px auto', padding: 24 }}>
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: 16 }}>← 홈으로</button>
      {/* 진행 상황 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        fontSize: 16,
        color: '#666',
        fontWeight: 500
      }}>
        <span>{currentSentenceIndex + 1} / {testSentences.length}</span>
        <span>점수: {score}점</span>
      </div>
      {/* 한글 해석(힌트) - 먼저 표시 */}
      <div style={{
        color: '#666',
        marginBottom: 24,
        padding: '16px',
        background: '#f8f9fa',
        borderRadius: '8px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {currentSentence?.korean}
      </div>
      {/* 문제(영어) - 아래에 표시 */}
      <div style={{ marginBottom: 24 }}>
        {renderSentence()}
      </div>

      {/* 결과 표시 */}
      {showResults && (
        <div style={{
          marginBottom: 24,
          padding: '16px',
          background: isAllCorrect ? '#e8f5e8' : '#fef2f2',
          borderRadius: '8px',
          border: `1px solid ${isAllCorrect ? '#4CAF50' : '#ff6b6b'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            {isAllCorrect ? (
              <>
                <Check size={20} style={{ color: '#4CAF50' }} />
                <span style={{ color: '#2e7d32', fontWeight: '500' }}>정답 확인 완료!</span>
              </>
            ) : (
              <>
                <X size={20} style={{ color: '#ff6b6b' }} />
                <span style={{ color: '#ff6b6b', fontWeight: '500' }}>틀렸습니다</span>
              </>
            )}
          </div>
          {!isAllCorrect && (
            <div style={{ fontSize: 15, color: '#333', marginBottom: 8 }}>
              <span style={{ color: '#888', marginRight: 8 }}>정답:</span>
              {words.map((word, wordIndex) => {
                const isBlankWord = blanksArray.includes(wordIndex);
                return (
                  <span key={wordIndex} style={isBlankWord ? {
                    background: '#fff3cd',
                    color: '#13204e',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    marginRight: '2px',
                    transition: 'all 0.2s'
                  } : {}}>
                    {word}{wordIndex < words.length - 1 ? ' ' : ''}
                  </span>
                );
              })}
            </div>
          )}
          <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>
            초록색: 정답, 빨간색: 오답
          </p>
        </div>
      )}

      {/* 버튼들 */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        {!showResults ? (
          <button 
            className="btn btn-primary" 
            onClick={checkAnswer}
            disabled={!currentSentence}
          >
            정답 확인
          </button>
        ) : (
          <>
            {currentSentenceIndex < testSentences.length - 1 ? (
              <button className="btn btn-mint" onClick={nextSentence}>
                다음 문장
              </button>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#13204e', marginBottom: 16 }}>테스트 완료!</h3>
                <p style={{ color: '#666', marginBottom: 16 }}>
                  총점: {score}점 / {totalQuestions}점
                </p>
                <button className="btn btn-primary" onClick={restartTest}>
                  <RotateCcw size={16} style={{ marginRight: 8 }} />
                  다시 테스트
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SentenceTest; 