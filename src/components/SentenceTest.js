import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, RotateCcw } from 'lucide-react';

function SentenceTest({ sentenceBooks, onBack }) {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // blanks가 있는 문장들만 필터링
  const testableSentences = sentenceBooks
    .flatMap(book => book.sentences || [])
    .filter(sentence => sentence.blanks && sentence.blanks.length > 0);

  useEffect(() => {
    setTotalQuestions(testableSentences.length);
    setUserAnswers({});
    setShowResults(false);
    setScore(0);
  }, [testableSentences.length]);

  const currentSentence = testableSentences[currentSentenceIndex];
  const blanksArray = currentSentence?.blanks || [];
  const words = currentSentence?.english.split(/\s+/).filter(word => word.length > 0) || [];

  const handleAnswerInput = (wordIndex, value) => {
    setUserAnswers(prev => ({
      ...prev,
      [wordIndex]: value
    }));
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
    if (currentSentenceIndex < testableSentences.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
      setUserAnswers({});
      setShowResults(false);
    }
  };

  const resetTest = () => {
    setCurrentSentenceIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setScore(0);
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

  if (testableSentences.length === 0) {
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
        <span>{currentSentenceIndex + 1} / {testableSentences.length}</span>
        <span>점수: {score}점</span>
      </div>

      {/* 문장 */}
      <div style={{ marginBottom: 24 }}>
        {renderSentence()}
      </div>

      {/* 한글 해석 */}
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
            {currentSentenceIndex < testableSentences.length - 1 ? (
              <button className="btn btn-mint" onClick={nextSentence}>
                다음 문장
              </button>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ color: '#13204e', marginBottom: 16 }}>테스트 완료!</h3>
                <p style={{ color: '#666', marginBottom: 16 }}>
                  총점: {score}점 / {totalQuestions}점
                </p>
                <button className="btn btn-primary" onClick={resetTest}>
                  <RotateCcw size={16} style={{ marginRight: 8 }} />
                  다시 시작
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