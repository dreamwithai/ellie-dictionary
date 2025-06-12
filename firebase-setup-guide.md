# 🔥 Firebase 클라우드 저장 연동 가이드

Firebase를 사용하면 데이터를 클라우드에 저장하여 어디서든 접근할 수 있어요!

## 1. Firebase 설정

### 패키지 설치
```bash
npm install firebase
```

### Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 새 프로젝트 생성
3. Firestore Database 활성화
4. 웹 앱 등록 후 config 정보 복사

### 환경 설정 파일 (.env)
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 2. Firebase 초기화 코드

### src/firebase.js
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

## 3. 장점과 단점

### 장점 ✅
- 클라우드 저장으로 어디서든 접근
- 실시간 동기화
- 자동 백업
- 여러 기기 간 동기화

### 단점 ❌
- 인터넷 연결 필요
- 구글 계정 로그인 필요
- 유료 플랜 필요할 수 있음 (무료: 1GB, 50,000 reads/day)
- 복잡한 설정

## 4. 추천 상황
- 여러 기기에서 사용해야 하는 경우
- 친구들과 단어장을 공유하고 싶은 경우
- 항상 인터넷이 연결된 환경

## 5. 현재 상황에서는...
**15세 여중생 개인 사용**이라면 현재의 localStorage + 백업 파일 방식이 더 적합할 것 같아요! 🎯 