import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { 
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  arrayUnion, 
  serverTimestamp,
  query,
  orderBy,
  getDocs
} from 'firebase/firestore';

// Firebase config 
const firebaseConfig = {
  apiKey: "AIzaSyAt3UZgwwiHrXQ8fhS0IFh2dfllYhfpv2w",
  authDomain: "athena-abafd.firebaseapp.com",
  projectId: "athena-abafd",
  storageBucket: "athena-abafd.firebasestorage.app",
  messagingSenderId: "91346159863",
  appId: "1:91346159863:web:022cf4ff18038c76b2abf2",
  measurementId: "G-5YNQBZPD91"
};
  
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();


const createNewConversation = async (userId, initialMessage) => {
  const conversationsRef = collection(db, 'users', userId, 'conversations');
  const newConversationRef = doc(conversationsRef);
  
 await setDoc(newConversationRef, {
  title: initialMessage.substring(0, 30) || 'New Chat',
  createdAt: serverTimestamp(), 
  updatedAt: serverTimestamp(),  
  messages: [{
    content: initialMessage,
    role: 'user',
    timestamp: new Date().toISOString()  // ⚠️ Use client timestamp
  }]
});
  
  return newConversationRef.id;
};

const addMessageToConversation = async (userId, conversationId, message, role = 'user') => {
  const conversationRef = doc(db, 'users', userId, 'conversations', conversationId);
  
  await updateDoc(conversationRef, {
  messages: arrayUnion({
    content: message,
    role: role,
    timestamp: new Date().toISOString()  
  }),
  updatedAt: serverTimestamp() 
});
};

const getUserConversations = async (userId) => {
  const conversationsRef = collection(db, 'users', userId, 'conversations');
  const q = query(conversationsRef, orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};


const getConversationMessages = async (userId, conversationId) => {
  const conversationRef = doc(db, 'users', userId, 'conversations', conversationId);
  const docSnap = await getDoc(conversationRef);
  return docSnap.exists() ? docSnap.data().messages : [];
};


export { 
  auth,
  provider,
  signInWithPopup,
  db,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  arrayUnion,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  createNewConversation,
  addMessageToConversation,
  getUserConversations,
  getConversationMessages
};