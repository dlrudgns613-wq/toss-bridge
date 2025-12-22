// js/firebase-config.js

const firebaseConfig = {
    apiKey: "AIzaSyCUyHxdW7I3f3P3n915oKszPTrYz7COg0Q", // 개발자님 키 유지
    authDomain: "smartsplit-7075a.firebaseapp.com",
    projectId: "smartsplit-7075a",
    storageBucket: "smartsplit-7075a.firebasestorage.app",
    messagingSenderId: "717652424048",
    appId: "1:717652424048:web:26b5db2078a8435e474bb5"
};

function initFirebase() {
    // ★ [깊은 생각의 결과] 안전장치 추가!
    // "앱이 없으면 만들고, 있으면 기존꺼 써라" (새로고침 에러 방지)
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    return firebase.firestore();
}
