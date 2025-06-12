import React, { useState } from 'react';
import { ArrowRight, CheckCircle, XCircle, RotateCcw, Play, BookOpen } from 'lucide-react';

function WordTest({ wordBooks, onBack }) {
  const [testStep, setTestStep] = useState('setup'); // 'setup', 'testing', 'result'
  const [selectedWordBooks, setSelectedWordBooks] = useState(new Set());
  const [testMode, setTestMode] = useState('english-to-korean'); // 'english-to-korean', 'korean-to-english'
  const [testWords, setTestWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [results, setResults] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);

  // 테스트 시작
  const startTest = () => {
    if (selectedWordBooks.size === 0) {
      alert('테스트할 단어장을 선택해주세요!');
      return;
    }

    // 선택된 단어장들에서 모든 단어 수집
    const allWords = [];
    wordBooks.forEach(book => {
      if (selectedWordBooks.has(book.id)) {
        book.words.forEach(word => {
          allWords.push({
            ...word,
            bookTitle: book.title
          });
        });
      }
    });

    if (allWords.length === 0) {
      alert('선택된 단어장에 단어가 없습니다!');
      return;
    }

    // 단어 순서 섞기
    const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
    setTestWords(shuffledWords);
    setCurrentWordIndex(0);
    setResults([]);
    setUserAnswer('');
    setShowAnswer(false);
    setTestStep('testing');
  };

  // 답안 제출
  const submitAnswer = () => {
    const currentWord = testWords[currentWordIndex];
    const correctAnswer = testMode === 'english-to-korean' ? currentWord.korean : currentWord.english;
    const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();

    const result = {
      word: currentWord,
      userAnswer: userAnswer.trim(),
      correctAnswer,
      isCorrect,
      testMode
    };

    setResults([...results, result]);
    setShowAnswer(true);
  };

  // 다음 문제
  const nextQuestion = () => {
    if (currentWordIndex < testWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setUserAnswer('');
      setShowAnswer(false);
    } else {
      // 테스트 완료
      setTestStep('result');
    }
  };

  // 테스트 재시작
  const restartTest = () => {
    setTestStep('setup');
    setSelectedWordBooks(new Set());
    setTestWords([]);
    setCurrentWordIndex(0);
    setResults([]);
    setUserAnswer('');
    setShowAnswer(false);
  };

  // 단어장 선택/해제
  const toggleWordBook = (bookId) => {
    const newSelected = new Set(selectedWordBooks);
    if (newSelected.has(bookId)) {
      newSelected.delete(bookId);
    } else {
      newSelected.add(bookId);
    }
    setSelectedWordBooks(newSelected);
  };

  // Enter 키로 답안 제출
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !showAnswer && userAnswer.trim()) {
      submitAnswer();
    }
  };

  // 테스트 설정 화면
  if (testStep === 'setup') {
    return (
      <div>
        <div className="card">
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
            📝 단어 테스트
          </h2>

          {/* 단어장 선택 */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>테스트할 단어장 선택</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {wordBooks.map(book => (
                <div
                  key={book.id}
                  onClick={() => toggleWordBook(book.id)}
                  style={{
                    padding: '12px 16px',
                    border: `2px solid ${selectedWordBooks.has(book.id) ? '#667eea' : '#e1e5e9'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    backgroundColor: selectedWordBooks.has(book.id) ? '#f0f2ff' : 'white',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#333' }}>{book.title}</strong>
                      <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                        {book.words.length}개 단어
                      </div>
                    </div>
                    {selectedWordBooks.has(book.id) && (
                      <CheckCircle size={20} style={{ color: '#667eea' }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 테스트 모드 선택 */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>테스트 모드</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={() => setTestMode('english-to-korean')}
                className={`btn ${testMode === 'english-to-korean' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '16px' }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>영어 → 한글</div>
                  <div style={{ fontSize: '12px', opacity: '0.8' }}>영어를 보고 한글 뜻 맞히기</div>
                </div>
              </button>
              
              <button
                onClick={() => setTestMode('korean-to-english')}
                className={`btn ${testMode === 'korean-to-english' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '16px' }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>한글 → 영어</div>
                  <div style={{ fontSize: '12px', opacity: '0.8' }}>한글을 보고 영어 단어 맞히기</div>
                </div>
              </button>
            </div>
          </div>

          {/* 시작 버튼 */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={startTest}
              className="btn btn-primary"
              style={{ padding: '16px 32px', fontSize: '18px' }}
            >
              <Play size={20} />
              테스트 시작
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 테스트 진행 화면
  if (testStep === 'testing') {
    const currentWord = testWords[currentWordIndex];
    const question = testMode === 'english-to-korean' ? currentWord.english : currentWord.korean;
    const correctAnswer = testMode === 'english-to-korean' ? currentWord.korean : currentWord.english;

    return (
      <div>
        <div className="card">
          {/* 진행률 */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              {currentWordIndex + 1} / {testWords.length}
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: '#e1e5e9', 
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${((currentWordIndex + 1) / testWords.length) * 100}%`,
                height: '100%',
                backgroundColor: '#667eea',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {/* 문제 */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
              {testMode === 'english-to-korean' ? '다음 영어 단어의 한글 뜻은?' : '다음 한글의 영어 단어는?'}
            </div>
            <div style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#333',
              marginBottom: '8px'
            }}>
              {question}
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              출처: {currentWord.bookTitle}
            </div>
          </div>

          {/* 답안 입력 */}
          {!showAnswer ? (
            <div style={{ marginBottom: '30px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="답을 입력하세요"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                autoFocus
                style={{ 
                  textAlign: 'center', 
                  fontSize: '18px',
                  padding: '16px'
                }}
              />
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  onClick={submitAnswer}
                  className="btn btn-primary"
                  disabled={!userAnswer.trim()}
                  style={{ padding: '12px 24px' }}
                >
                  답안 제출
                </button>
              </div>
            </div>
          ) : (
            // 결과 표시
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
              <div style={{ 
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: results[results.length - 1]?.isCorrect ? '#f0f9ff' : '#fef2f2',
                border: `2px solid ${results[results.length - 1]?.isCorrect ? '#2ed573' : '#ff4757'}`,
                marginBottom: '20px'
              }}>
                {results[results.length - 1]?.isCorrect ? (
                  <div style={{ color: '#2ed573' }}>
                    <CheckCircle size={32} style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>정답!</div>
                  </div>
                ) : (
                  <div style={{ color: '#ff4757' }}>
                    <XCircle size={32} style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>틀렸습니다</div>
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ fontSize: '14px', color: '#666' }}>내 답: {userAnswer}</div>
                      <div style={{ fontSize: '14px', color: '#333', fontWeight: 'bold' }}>
                        정답: {correctAnswer}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={nextQuestion}
                className="btn btn-primary"
                style={{ padding: '12px 24px' }}
              >
                {currentWordIndex < testWords.length - 1 ? (
                  <>
                    다음 문제 <ArrowRight size={16} />
                  </>
                ) : (
                  '결과 보기'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 결과 화면
  if (testStep === 'result') {
    const correctCount = results.filter(r => r.isCorrect).length;
    const totalCount = results.length;
    const percentage = Math.round((correctCount / totalCount) * 100);

    return (
      <div>
        <div className="card">
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
            🎯 테스트 결과
          </h2>

          {/* 점수 */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ 
              fontSize: '48px', 
              fontWeight: 'bold', 
              color: percentage >= 80 ? '#2ed573' : percentage >= 60 ? '#ffa502' : '#ff4757',
              marginBottom: '8px'
            }}>
              {percentage}%
            </div>
            <div style={{ fontSize: '18px', color: '#666' }}>
              {correctCount} / {totalCount} 정답
            </div>
          </div>

          {/* 상세 결과 */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#333', marginBottom: '15px' }}>상세 결과</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {results.map((result, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    borderRadius: '8px',
                    backgroundColor: result.isCorrect ? '#f0f9ff' : '#fef2f2',
                    border: `1px solid ${result.isCorrect ? '#2ed573' : '#ff4757'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>
                        {result.testMode === 'english-to-korean' ? result.word.english : result.word.korean}
                      </strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        출처: {result.word.bookTitle}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {result.isCorrect ? (
                        <CheckCircle size={20} style={{ color: '#2ed573' }} />
                      ) : (
                        <div>
                          <XCircle size={20} style={{ color: '#ff4757' }} />
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            정답: {result.correctAnswer}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 버튼들 */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={restartTest}
              className="btn btn-secondary"
            >
              <RotateCcw size={16} />
              다시 테스트
            </button>
            <button
              onClick={onBack}
              className="btn btn-primary"
            >
              <BookOpen size={16} />
              단어장으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default WordTest; 