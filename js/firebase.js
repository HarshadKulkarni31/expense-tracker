// ============================================================
// FIREBASE - Auth, household membership, and shared persistence
// ============================================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import {
  getFirestore,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

// Replace these values with your Firebase project configuration.
const firebaseConfig = {
  apiKey: 'AIzaSyASfQWHEVs2cYVvvNqww4RbNFwu4BKKnUo',
  authDomain: 'spendwise-ff96a.firebaseapp.com',
  projectId: 'spendwise-ff96a',
  storageBucket: 'spendwise-ff96a.firebasestorage.app',
  messagingSenderId: '854891521117',
  appId: '1:854891521117:web:ba83485c9c832d5aad99b4',
  measurementId: 'G-VGL9E0FPW3'
};

let app;
let auth;
let db;

function ensureFirebase() {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase config is not set. Update js/firebase.js with your project settings.');
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }

  return { auth, db };
}

export function isFirebaseConfigured() {
  return (
    Boolean(firebaseConfig.apiKey) &&
    Boolean(firebaseConfig.projectId) &&
    Boolean(firebaseConfig.appId)
  );
}

export function watchAuth(callback) {
  const { auth: firebaseAuth } = ensureFirebase();
  return onAuthStateChanged(firebaseAuth, callback);
}

export async function signUpUser({ name, email, password }) {
  const { auth: firebaseAuth } = ensureFirebase();
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  await updateProfile(credential.user, { displayName: name });

  try {
    await setDoc(doc(db, 'users', credential.user.uid), {
      displayName: name,
      email,
      householdId: null,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    throw new Error(`Account was created, but the Firestore user profile could not be saved. ${error.message}`);
  }

  return credential.user;
}

export async function signInUser({ email, password }) {
  const { auth: firebaseAuth } = ensureFirebase();
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  return credential.user;
}

export async function signOutUser() {
  const { auth: firebaseAuth } = ensureFirebase();
  await signOut(firebaseAuth);
}

export async function getUserProfile(uid) {
  const { db: firestore } = ensureFirebase();
  const snapshot = await getDoc(doc(firestore, 'users', uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function createUserProfileIfMissing(user) {
  const profile = await getUserProfile(user.uid);
  if (profile) return profile;

  const fallbackName = user.displayName || user.email?.split('@')[0] || 'Family member';
  const newProfile = {
    displayName: fallbackName,
    email: user.email,
    householdId: null,
    createdAt: serverTimestamp()
  };

  const { db: firestore } = ensureFirebase();
  await setDoc(doc(firestore, 'users', user.uid), newProfile);
  return { ...newProfile, createdAt: null };
}

export async function createHousehold({ name, user }) {
  const { db: firestore } = ensureFirebase();
  const householdRef = doc(collection(firestore, 'households'));
  const inviteCode = await createUniqueInviteCode(firestore);

  await setDoc(householdRef, {
    name,
    inviteCode,
    ownerId: user.uid,
    members: {
      [user.uid]: true
    },
    memberNames: {
      [user.uid]: user.displayName || user.email
    },
    createdAt: serverTimestamp()
  });

  await setDoc(doc(firestore, 'users', user.uid), {
    displayName: user.displayName || user.email,
    email: user.email,
    householdId: householdRef.id,
    updatedAt: serverTimestamp()
  }, { merge: true });

  await setDoc(getHouseholdDataRef(householdRef.id), getInitialHouseholdData());
  await setDoc(doc(firestore, 'inviteCodes', inviteCode), {
    householdId: householdRef.id,
    createdAt: serverTimestamp()
  });

  return {
    id: householdRef.id,
    name,
    inviteCode,
    ownerId: user.uid,
    members: { [user.uid]: true },
    memberNames: { [user.uid]: user.displayName || user.email }
  };
}

export async function joinHousehold({ inviteCode, user }) {
  const { db: firestore } = ensureFirebase();
  const cleanedCode = inviteCode.trim().toUpperCase();
  const inviteSnapshot = await getDoc(doc(firestore, 'inviteCodes', cleanedCode));

  if (!inviteSnapshot.exists()) {
    throw new Error('No family found with that invite code.');
  }

  const { householdId } = inviteSnapshot.data();
  const householdRef = doc(firestore, 'households', householdId);
  const memberName = user.displayName || user.email;

  await updateDoc(householdRef, {
    [`members.${user.uid}`]: true,
    [`memberNames.${user.uid}`]: memberName
  });

  await setDoc(doc(firestore, 'users', user.uid), {
    displayName: memberName,
    email: user.email,
    householdId,
    updatedAt: serverTimestamp()
  }, { merge: true });

  const dataRef = getHouseholdDataRef(householdId);
  const dataSnapshot = await getDoc(dataRef);
  if (!dataSnapshot.exists()) {
    await setDoc(dataRef, getInitialHouseholdData());
  }

  const householdDoc = await getDoc(householdRef);
  if (!householdDoc.exists()) {
    throw new Error('This invite code is no longer valid.');
  }

  return {
    id: householdId,
    ...householdDoc.data()
  };
}

export async function getHousehold(householdId) {
  const { db: firestore } = ensureFirebase();
  const snapshot = await getDoc(doc(firestore, 'households', householdId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function loadHouseholdData(householdId) {
  const snapshot = await getDoc(getHouseholdDataRef(householdId));
  return snapshot.exists() ? snapshot.data() : getInitialHouseholdData();
}

export async function saveHouseholdData(householdId, data) {
  await setDoc(getHouseholdDataRef(householdId), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function clearHouseholdData(householdId) {
  await deleteDoc(getHouseholdDataRef(householdId));
  await setDoc(getHouseholdDataRef(householdId), getInitialHouseholdData());
}

function getHouseholdDataRef(householdId) {
  const { db: firestore } = ensureFirebase();
  return doc(firestore, 'households', householdId, 'data', 'main');
}

function getInitialHouseholdData() {
  return {
    expenses: [],
    budgets: [],
    recurring: [],
    settings: { overallBudget: 50000 }
  };
}

async function createUniqueInviteCode(firestore) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = createInviteCode();
    const existing = await getDoc(doc(firestore, 'inviteCodes', code));
    if (!existing.exists()) return code;
  }

  throw new Error('Could not create a unique invite code. Please try again.');
}

function createInviteCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}
