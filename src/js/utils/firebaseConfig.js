/**
 * Firebase Configuration
 * Initialize Firebase and export DB references
 * 
 * TODO: Replace the following config with your Firebase project settings
 * Go to Firebase Console > Project Settings to get your config
 */

// Firebase Configuration - REPLACE WITH YOUR CONFIG
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get reference to the database
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

logger.info('Firebase initialized successfully', { projectId: firebaseConfig.projectId });
