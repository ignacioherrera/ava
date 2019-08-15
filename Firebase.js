import * as firebase from 'firebase';
import firestore from 'firebase/firestore'

const settings = {};

var firebaseConfig = {
    apiKey: "AIzaSyDWLalJbaY58piQm6y-vs7gf_xRl6Z5Izc",
    authDomain: "gift-bf0b0.firebaseapp.com",
    databaseURL: "https://gift-bf0b0.firebaseio.com",
    projectId: "gift-bf0b0",
    storageBucket: "gift-bf0b0.appspot.com",
    messagingSenderId: "634464955673",
    appId: "1:634464955673:web:ca6352b5c09c705b"
  };
try{
  firebase.initializeApp(firebaseConfig);
firebase.firestore().settings(settings);
}
catch(e){
  alert('No Firebase Connection');
}

export default firebase;