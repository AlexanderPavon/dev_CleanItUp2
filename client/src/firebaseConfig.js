// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApNNymM4B2diCR18kS0jxO3OjECpuGgH0",
  authDomain: "cleanitup-b5b1c.firebaseapp.com",
  projectId: "cleanitup-b5b1c",
  storageBucket: "cleanitup-b5b1c.firebasestorage.app",
  messagingSenderId: "970153188550",
  appId: "1:970153188550:web:0588f4a787948b047dcbc7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error en inicio con Google:", error);
    return null;
  }
};

export { auth, signInWithGoogle };