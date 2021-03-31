import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const config = {
  apiKey: __myapp.env.apiKey,
  appId: __myapp.env.appId,
  authDomain: __myapp.env.authDomain,
  databaseURL: __myapp.env.databaseURL,
  measurementId: __myapp.env.measurementId,
  messagingSenderId: __myapp.env.messagingSenderId,
  projectId: __myapp.env.projectId,
  storageBucket: __myapp.env.storageBucket,
};

if (!firebase.apps.length) {
  firebase.initializeApp(config);
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
}

//export const authProvider = new firebase.auth.FacebookAuthProvider();
export const authProvider = new firebase.auth.GoogleAuthProvider();
// authProvider.addScope("groups_show_list");
export const auth = firebase.auth();
export const store = firebase.firestore();