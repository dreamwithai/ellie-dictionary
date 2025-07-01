import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Book, Edit3, Trash2, Eye, ArrowLeft, Settings, Home, Target, ArrowUp } from 'lucide-react';
import WordBookList from './components/WordBookList';
import WordBookDetail from './components/WordBookDetail';
import CreateWordBook from './components/CreateWordBook';
import SearchResults from './components/SearchResults';
import DataManager from './components/DataManager';
import DebugInfo from './components/DebugInfo';
import WordTest from './components/WordTest';
import SentenceTest from './components/SentenceTest';
import SentenceManager from './components/SentenceManager';
import SentenceBookList from './components/SentenceBookList';
import SentenceBookDetail from './components/SentenceBookDetail';

const APP_VERSION = '3';

function App() {
  const [wordBooks, setWordBooks] = useState([]);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'detail', 'create', 'search', 'settings', 'test', 'wordTest', 'sentenceTest', 'sentence', 'sentenceBooks', 'sentenceBookDetail'
  const [selectedWordBook, setSelectedWordBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ wordResults: [], sentenceResults: [] });
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [headerImage, setHeaderImage] = useState(() => {
    return localStorage.getItem('headerImage') || '';
  });
  const [sentences, setSentences] = useState([]); // 전체 문장 관리
  const [sentenceBooks, setSentenceBooks] = useState([]); // 문장북 리스트
  const [selectedSentenceBook, setSelectedSentenceBook] = useState(null);
  const appRootRef = useRef(null);

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const savedWordBooks = localStorage.getItem('ellieDictionary');
    if (savedWordBooks) {
      setWordBooks(JSON.parse(savedWordBooks));
    }
    
    const savedSentenceBooks = localStorage.getItem('ellieSentenceBooks');
    if (savedSentenceBooks) {
      setSentenceBooks(JSON.parse(savedSentenceBooks));
    }
  }, []);

  // PWA 설치 프롬프트 처리
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA 설치 프롬프트 감지됨');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA 설치 완료');
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    // 사용법 안내 제거

    // PWA 설치 가능 여부 체크
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      console.log('PWA 지원 브라우저입니다');
    } else {
      console.log('PWA를 완전히 지원하지 않는 브라우저입니다');
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 로컬 스토리지에 데이터 저장
  useEffect(() => {
    localStorage.setItem('ellieDictionary', JSON.stringify(wordBooks));
  }, [wordBooks]);

  // 문장북 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('ellieSentenceBooks', JSON.stringify(sentenceBooks));
  }, [sentenceBooks]);

  // 이미지 변경시 반영 (설정에서 업로드 시)
  useEffect(() => {
    const onStorage = () => {
      setHeaderImage(localStorage.getItem('headerImage') || '');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // 단어장 생성
  const createWordBook = (wordBookData) => {
    const newWordBook = {
      id: Date.now(),
      ...wordBookData,
      words: [],
      createdAt: new Date().toISOString()
    };
    setWordBooks([...wordBooks, newWordBook]);
    setCurrentView('list');
  };

  // 단어장 삭제
  const deleteWordBook = (id) => {
    setWordBooks(wordBooks.filter(book => book.id !== id));
  };

  // 단어 추가
  const addWord = (wordBookId, wordData) => {
    const updatedWordBooks = wordBooks.map(book => 
      book.id === wordBookId 
        ? { ...book, words: [...book.words, { id: Date.now(), ...wordData }] }
        : book
    );
    
    setWordBooks(updatedWordBooks);
    
    // selectedWordBook도 함께 업데이트
    if (selectedWordBook && selectedWordBook.id === wordBookId) {
      const updatedSelectedBook = updatedWordBooks.find(book => book.id === wordBookId);
      setSelectedWordBook(updatedSelectedBook);
    }
  };

  // 단어 삭제
  const deleteWord = (wordBookId, wordId) => {
    const updatedWordBooks = wordBooks.map(book => 
      book.id === wordBookId 
        ? { ...book, words: book.words.filter(word => word.id !== wordId) }
        : book
    );
    setWordBooks(updatedWordBooks);
    
    // selectedWordBook도 함께 업데이트
    if (selectedWordBook && selectedWordBook.id === wordBookId) {
      const updatedSelectedBook = updatedWordBooks.find(book => book.id === wordBookId);
      setSelectedWordBook(updatedSelectedBook);
    }
  };

  // 단어 수정
  const updateWord = (wordBookId, wordId, updatedWordData) => {
    const updatedWordBooks = wordBooks.map(book => 
      book.id === wordBookId 
        ? { 
            ...book, 
            words: book.words.map(word => 
              word.id === wordId 
                ? { ...word, ...updatedWordData }
                : word
            )
          }
        : book
    );
    
    setWordBooks(updatedWordBooks);
    
    // selectedWordBook도 함께 업데이트
    if (selectedWordBook && selectedWordBook.id === wordBookId) {
      const updatedSelectedBook = updatedWordBooks.find(book => book.id === wordBookId);
      setSelectedWordBook(updatedSelectedBook);
    }
  };

  // 검색 기능
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults({ wordResults: [], sentenceResults: [] });
      setCurrentView('list');
      return;
    }

    // 단어장 검색
    const wordResults = [];
    wordBooks.forEach(book => {
      const matchingWords = book.words.filter(word => 
        word.english.toLowerCase().includes(query.toLowerCase()) ||
        word.korean.toLowerCase().includes(query.toLowerCase())
      );
      if (matchingWords.length > 0) {
        wordResults.push({
          wordBook: book,
          words: matchingWords
        });
      }
    });

    // 문장북 검색 (영어/한글)
    const sentenceResults = [];
    sentenceBooks.forEach(book => {
      const matchingSentences = (book.sentences || []).filter(sentence =>
        (sentence.english && sentence.english.toLowerCase().includes(query.toLowerCase())) ||
        (sentence.korean && sentence.korean.toLowerCase().includes(query.toLowerCase()))
      );
      if (matchingSentences.length > 0) {
        sentenceResults.push({
          sentenceBook: book,
          sentences: matchingSentences
        });
      }
    });

    setSearchResults({ wordResults, sentenceResults });
    setCurrentView('search');
  };

  // 단어장 상세보기
  const viewWordBook = (wordBook) => {
    setSelectedWordBook(wordBook);
    setCurrentView('detail');
  };

  // 데이터 가져오기 (백업 파일에서)
  const importData = (importedWordBooks) => {
    const mergedWordBooks = [...wordBooks];
    
    importedWordBooks.forEach(importedBook => {
      // ID 충돌 방지를 위해 새로운 ID 생성
      const newId = Date.now() + Math.random();
      const newWordBook = {
        ...importedBook,
        id: newId,
        words: importedBook.words.map(word => ({
          ...word,
          id: Date.now() + Math.random()
        }))
      };
      mergedWordBooks.push(newWordBook);
    });
    
    setWordBooks(mergedWordBooks);
  };

  // 문장북 데이터 가져오기
  const importSentenceData = (importedSentenceBooks) => {
    const mergedSentenceBooks = [...sentenceBooks];
    
    importedSentenceBooks.forEach(importedBook => {
      // ID 충돌 방지를 위해 새로운 ID 생성
      const newId = Date.now() + Math.random();
      const newSentenceBook = {
        ...importedBook,
        id: newId,
        sentences: (importedBook.sentences || []).map(sentence => ({
          ...sentence,
          id: Date.now() + Math.random()
        }))
      };
      mergedSentenceBooks.push(newSentenceBook);
    });
    
    setSentenceBooks(mergedSentenceBooks);
  };

  // 홈으로 가기
  const goHome = () => {
    if (currentView === 'search') {
      setSearchQuery('');
      setSearchResults({ wordResults: [], sentenceResults: [] });
    }
    setCurrentView('list');
    setSelectedWordBook(null);
    setSelectedSentenceBook(null);
  };

  // PWA 설치 처리
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    
    setDeferredPrompt(null);
  };

  // 맨 위로 스크롤 함수
  const scrollToTop = () => {
    if (appRootRef.current) {
      appRootRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 자유의 여신상 SVG (간단 버전, 실제로는 별도 파일로 분리 가능)
  const StatueOfLibertySVG = () => (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="#fff" strokeWidth="2">
        <path d="M44 44V30M44 30L41 24M44 30L47 24"/>
        <path d="M41 24L44 18L47 24"/>
        <circle cx="44" cy="16" r="2" fill="#fff"/>
        <path d="M44 14V10"/>
        <path d="M42 12L39 9"/>
        <path d="M46 12L49 9"/>
      </g>
    </svg>
  );

  return (
    <div className="app-root" ref={appRootRef} style={{ height: '100vh', overflowY: 'auto', background: '#f8fafc', padding: 0 }}>
      {/* 전체 스크롤 영역: 헤더+검색+메뉴+컨텐츠 */}
      <div style={{ background: '#13204e', boxShadow: '0 2px 12px #0002' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', minHeight: 100, padding: '0 20px', marginTop: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 32 }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.45em', letterSpacing: '-1px', marginBottom: 1 }}>
              윤채사전
            </span>
            <span style={{ color: '#cbd5e1', fontWeight: 400, fontSize: '0.92em', letterSpacing: '0.03em', opacity: 0.8, marginTop: 1, display: 'flex', alignItems: 'center', gap: 6, marginLeft: 0 }}>
              ENGLISH DICTIONARY
              <span style={{ color: '#bdbdbd', fontWeight: 400, fontSize: '0.85em' }}>
                .v{APP_VERSION}
              </span>
            </span>
          </div>
          {headerImage && (
            <img src={headerImage} alt="프로필" style={{ width: 62, height: 62, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #fff', background: '#eee', marginTop: 38 }} />
          )}
        </div>
      </div>
      <div style={{ background: '#13204e', boxShadow: '0 2px 12px #0002', paddingBottom: 16 }}>
        {/* 검색바 */}
        <div style={{ margin: '0 auto', maxWidth: 480 }}>
          <div style={{ background: '#fff', borderRadius: 32, boxShadow: '0 2px 12px #0001', padding: '8px 16px', margin: '0 16px', display: 'flex', alignItems: 'center', gap: 8, transform: 'translateY(38px)' }}>
            <Search size={22} color="#13204e" />
            <input
              type="text"
              className="search-input"
              placeholder="영어 단어나 한글 뜻을 검색해보세요..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: 17, flex: 1, background: '#fff', color: '#222', padding: 0 }}
            />
          </div>
        </div>
        {/* 메뉴 버튼 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
          marginTop: 56,
          marginBottom: 8,
          flexWrap: 'nowrap',
          overflowX: 'auto',
          padding: '0 8px',
          maxWidth: 420,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          <button
            className="btn btn-mint"
            onClick={goHome}
            style={{ minWidth: 56 }}
          >
            <Home size={22} style={{ marginBottom: 2 }} />
          </button>
          <button
            className="btn btn-lavender"
            onClick={() => setCurrentView('create')}
            style={{ minWidth: 72 }}
          >
            <Plus size={22} style={{ marginBottom: 2 }} />
            단어
          </button>
          <button
            className="btn btn-lavender"
            onClick={() => { setCurrentView('sentenceBooks'); setSelectedSentenceBook(null); }}
            style={{ minWidth: 72 }}
          >
            <Plus size={22} style={{ marginBottom: 2 }} />
            문장
          </button>
          <button
            className="btn btn-mint"
            onClick={() => setCurrentView('test')}
            disabled={wordBooks.length === 0 && sentenceBooks.length === 0}
            style={{ minWidth: 72 }}
          >
            <Target size={22} style={{ marginBottom: 2 }} />
            TEST
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentView('settings')}
            style={{ minWidth: 56 }}
          >
            <Settings size={22} style={{ marginBottom: 2 }} />
          </button>
        </div>
      </div>
      {/* 메인 컨텐츠 영역 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* 메인 컨텐츠 */}
        {currentView === 'list' && (
          <>
            <WordBookList 
              wordBooks={wordBooks}
              onViewWordBook={viewWordBook}
              onDeleteWordBook={deleteWordBook}
            />
            <SentenceBookList
              sentenceBooks={sentenceBooks}
              setSentenceBooks={setSentenceBooks}
              onView={book => { setSelectedSentenceBook(book); setCurrentView('sentenceBookDetail'); }}
              hideAddButton={true}
            />
          </>
        )}

        {currentView === 'create' && (
          <CreateWordBook 
            onCreateWordBook={createWordBook}
            onCancel={() => setCurrentView('list')}
          />
        )}

        {currentView === 'detail' && selectedWordBook && (
          <WordBookDetail 
            wordBook={selectedWordBook}
            onAddWord={addWord}
            onDeleteWord={deleteWord}
            onUpdateWord={updateWord}
          />
        )}

        {currentView === 'search' && (
          <SearchResults 
            searchQuery={searchQuery}
            searchResults={searchResults.wordResults}
            sentenceResults={searchResults.sentenceResults}
            onViewWordBook={viewWordBook}
          />
        )}

        {currentView === 'settings' && (
          <DataManager 
            wordBooks={wordBooks}
            sentenceBooks={sentenceBooks}
            onImportData={importData}
            onImportSentenceData={importSentenceData}
          />
        )}

        {currentView === 'test' && (
          <div className="card" style={{ maxWidth: 480, margin: '32px auto', padding: 24 }}>
            <button className="btn btn-secondary" onClick={goHome} style={{ marginBottom: 16 }}>← 홈으로</button>
            <h2 style={{ marginBottom: 24, textAlign: 'center' }}>테스트 선택</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <button
                className="btn btn-mint"
                onClick={() => setCurrentView('wordTest')}
                disabled={wordBooks.length === 0}
                style={{ padding: '20px', fontSize: '16px', fontWeight: '500' }}
              >
                <Target size={24} style={{ marginBottom: 8 }} />
                단어 테스트
                <div style={{ fontSize: '14px', opacity: 0.8, marginTop: 4 }}>
                  단어장의 단어들로 테스트
                </div>
              </button>
              
              <button
                className="btn btn-lavender"
                onClick={() => setCurrentView('sentenceTest')}
                disabled={sentenceBooks.length === 0}
                style={{ padding: '20px', fontSize: '16px', fontWeight: '500' }}
              >
                <Target size={24} style={{ marginBottom: 8 }} />
                문장 테스트
                <div style={{ fontSize: '14px', opacity: 0.8, marginTop: 4 }}>
                  문장북의 문장으로 테스트
                </div>
              </button>
            </div>
          </div>
        )}

        {currentView === 'wordTest' && (
          <WordTest 
            wordBooks={wordBooks}
            onBack={() => setCurrentView('test')}
          />
        )}

        {currentView === 'sentenceTest' && (
          <SentenceTest 
            sentenceBooks={sentenceBooks}
            onBack={() => setCurrentView('test')}
          />
        )}

        {currentView === 'sentence' && (
          <SentenceManager 
            sentences={sentences}
            setSentences={setSentences}
            onBack={() => setCurrentView('list')}
          />
        )}

        {currentView === 'sentenceBooks' && !selectedSentenceBook && (
          <SentenceBookList
            sentenceBooks={sentenceBooks}
            setSentenceBooks={setSentenceBooks}
            onView={book => { setSelectedSentenceBook(book); setCurrentView('sentenceBookDetail'); }}
          />
        )}

        {currentView === 'sentenceBookDetail' && selectedSentenceBook && (
          <SentenceBookDetail
            sentenceBook={selectedSentenceBook}
            setSentenceBooks={setSentenceBooks}
            sentenceBooks={sentenceBooks}
            onBack={() => { setCurrentView('sentenceBooks'); setSelectedSentenceBook(null); }}
          />
        )}

        {/* 디버깅 정보 (개발 중에만 사용) */}
        {/* <DebugInfo wordBooks={wordBooks} selectedWordBook={selectedWordBook} /> */}
      </div>
      {/* 플로팅 맨 위로 버튼 */}
      {(currentView !== 'create' && currentView !== 'settings') && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            right: 24,
            bottom: currentView === 'test' ? 90 : 28,
            zIndex: 100,
            background: 'linear-gradient(135deg, #A8E6CF 60%, #B39DDB 100%)',
            color: '#374151',
            border: 'none',
            borderRadius: '50%',
            width: 54,
            height: 54,
            boxShadow: '0 4px 16px rgba(55,65,81,0.13)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            cursor: 'pointer',
            transition: 'background 0.2s, box-shadow 0.2s',
          }}
          title="맨 위로"
          aria-label="맨 위로"
        >
          <ArrowUp size={28} />
        </button>
      )}
    </div>
  );
}

export default App; 