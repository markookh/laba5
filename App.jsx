// This code demonstrates a simple Notes App using React and Firebase

import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const NotesApp = () => {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const provider = new GoogleAuthProvider();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setNotes([]);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const fetchNotes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "notes"));
      const notesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotes(notesData);
    } catch (error) {
      console.error("Failed to fetch notes", error);
    }
  };

  const addNote = async () => {
    if (newNote.trim() === "") return;

    try {
      const docRef = await addDoc(collection(db, "notes"), {
        text: newNote,
        userId: user.uid,
      });
      setNotes([...notes, { id: docRef.id, text: newNote }]);
      setNewNote("");
    } catch (error) {
      console.error("Failed to add note", error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await deleteDoc(doc(db, "notes", id));
      setNotes(notes.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Failed to delete note", error);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Notes App</h1>
      {user ? (
        <div>
          <p>Welcome, {user.displayName}</p>
          <button onClick={handleLogout}>Logout</button>

          <div>
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Write a note..."
            />
            <button onClick={addNote}>Add Note</button>
          </div>

          <ul>
            {notes.map((note) => (
              <li key={note.id}>
                {note.text} <button onClick={() => deleteNote(note.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <button onClick={handleLogin}>Login with Google</button>
      )}
    </div>
  );
};

export default NotesApp;

