// Firebase Configuration for Samrat Core Physics (compat SDK)
const firebaseConfig = {
    apiKey: "AIzaSyBX54xXhRmMigxdf_Lhw3SFGivzGAOXf04",
    authDomain: "my-try-327ea.firebaseapp.com",
    projectId: "my-try-327ea",
    storageBucket: "my-try-327ea.firebasestorage.app",
    messagingSenderId: "157605035524",
    appId: "1:157605035524:web:00bd79ac81b891cb11bf51",
    measurementId: "G-KQ7ZPGKZBC"
};

// Initialize Firebase (compat SDK loaded via CDN script tags)
firebase.initializeApp(firebaseConfig);

// Global references - accessible by all scripts loaded after this one
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

