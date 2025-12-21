// 파일 경로: toss-bridge/js/firebase-config.js

// 1. 파이어베이스 설정 
const firebaseConfig = {
    apiKey: "AIzaSyCUyHxdW7I3f3P3n915oKszPTrYz7COg0Q",      // 
    authDomain: "smartsplit-7075a.firebaseapp.com",
    projectId: "smartsplit-7075a",
    storageBucket: ""smartsplit-7075a.firebasestorage.app",
    messagingSenderId: "717652424048",
    appId: "1:717652424048:web:26b5db2078a8435e474bb5"
};

// 2. 파이어베이스 초기화 함수 (전역 변수로 만듦)
function initFirebase() {
    firebase.initializeApp(firebaseConfig);
    return firebase.firestore();
}
