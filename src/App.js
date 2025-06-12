import React, { useState, useEffect } from 'react';
import { Search, Plus, Book, Edit3, Trash2, Eye, ArrowLeft, Settings, Home, Target } from 'lucide-react';
import WordBookList from './components/WordBookList';
import WordBookDetail from './components/WordBookDetail';
import CreateWordBook from './components/CreateWordBook';
import SearchResults from './components/SearchResults';
import DataManager from './components/DataManager';
import DebugInfo from './components/DebugInfo';
import WordTest from './components/WordTest';

function App() {
  const [wordBooks, setWordBooks] = useState([]);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'detail', 'create', 'search', 'settings', 'test'
  const [selectedWordBook, setSelectedWordBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const savedWordBooks = localStorage.getItem('ellieDictionary');
    if (savedWordBooks) {
      setWordBooks(JSON.parse(savedWordBooks));
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
      setSearchResults([]);
      setCurrentView('list');
      return;
    }

    const results = [];
    wordBooks.forEach(book => {
      const matchingWords = book.words.filter(word => 
        word.english.toLowerCase().includes(query.toLowerCase()) ||
        word.korean.toLowerCase().includes(query.toLowerCase())
      );
      
      if (matchingWords.length > 0) {
        results.push({
          wordBook: book,
          words: matchingWords
        });
      }
    });

    setSearchResults(results);
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

  // 홈으로 가기
  const goHome = () => {
    if (currentView === 'search') {
      setSearchQuery('');
      setSearchResults([]);
    }
    setCurrentView('list');
    setSelectedWordBook(null);
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

  return (
    <div className="container">
      <div className="header">
        <div className="header-content">
          {currentView !== 'list' && (
            <button className="home-btn" onClick={goHome}>
              <Home size={20} />
            </button>
          )}
          <div className="header-text">
            <h1>📚 엘리의 단어장</h1>
            <p>영어 공부를 더 재미있게!</p>
          </div>
          <div className="header-spacer"></div>
        </div>
      </div>

      {/* 검색 바 */}
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="영어 단어나 한글 뜻을 검색해보세요..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <Search className="search-icon" size={24} />
      </div>



      {/* 메인 컨텐츠 */}
      {currentView === 'list' && (
        <>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '12px',
            marginBottom: '30px',
            flexWrap: 'wrap'
          }}>
            <button 
              className="btn btn-primary" 
              onClick={() => setCurrentView('create')}
            >
              <Plus size={20} />
              새 단어장 만들기
            </button>
            
            <button 
              className="btn btn-secondary" 
              onClick={() => setCurrentView('test')}
              disabled={wordBooks.length === 0}
            >
              <Target size={20} />
              단어 테스트
            </button>
            
            <button 
              className="btn btn-secondary" 
              onClick={() => setCurrentView('settings')}
            >
              <Settings size={20} />
              백업 & 설정
            </button>
          </div>
          <WordBookList 
            wordBooks={wordBooks}
            onViewWordBook={viewWordBook}
            onDeleteWordBook={deleteWordBook}
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
          searchResults={searchResults}
          onViewWordBook={viewWordBook}
        />
      )}

      {currentView === 'settings' && (
        <DataManager 
          wordBooks={wordBooks}
          onImportData={importData}
        />
      )}

      {currentView === 'test' && (
        <WordTest 
          wordBooks={wordBooks}
          onBack={() => setCurrentView('list')}
        />
      )}

      {/* 디버깅 정보 (개발 중에만 사용) */}
      {/* <DebugInfo wordBooks={wordBooks} selectedWordBook={selectedWordBook} /> */}
    </div>
  );
}

export default App; 