// انسخ بيانات مشروع Firebase خاصّتك هنا
const firebaseConfig = {
  apiKey: "AIzaSyDpmvUhRrBfc1ufsuXmWIr5grVhC2BJUL0",
  authDomain: "dammak-contest.firebaseapp.com",
  projectId: "dammak-contest",
  storageBucket: "dammak-contest.firebasestorage.app",
  messagingSenderId: "123096491291",
  appId: "1:123096491291:web:c6a41007792073089b9fbe"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();