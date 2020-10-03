import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const config = {
  apiKey: process.env.REACT_APP_firebase_apiKey,
  appId: process.env.REACT_APP_firebase_appId,
  authDomain: process.env.REACT_APP_firebase_authDomain,
  databaseURL: process.env.REACT_APP_firebase_databaseURL,
  measurementId: process.env.REACT_APP_firebase_measurementId,
  messagingSenderId: process.env.REACT_APP_firebase_messagingSenderId,
  projectId: process.env.REACT_APP_firebase_projectId,
  storageBucket: process.env.REACT_APP_firebase_storageBucket,
};

if (!firebase.apps.length) {
  firebase.initializeApp(config);
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
}

export const authProvider = new firebase.auth.FacebookAuthProvider();
// export const authProvider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();
export const store = firebase.firestore();
