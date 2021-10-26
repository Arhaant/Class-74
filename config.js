import firebase from 'firebase'
require('@firebase/firestore')

var firebaseConfig = {
    apiKey: "AIzaSyBdzoXWmP9eL42bmcCku6f7LxL7rtd2_nc",
    authDomain: "wily-45d46.firebaseapp.com",
    databaseURL: 'https://wily-45d46.firebaseio.com',
    projectId: "wily-45d46",
    storageBucket: "wily-45d46.appspot.com",
    messagingSenderId: "239398076943",
    appId: "1:239398076943:web:324ada76d4b2963307997a"
  };

  firebase.initializeApp(firebaseConfig)

  export default firebase.firestore()
