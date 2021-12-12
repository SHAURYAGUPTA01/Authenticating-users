import firebase from 'firebase';
require('@firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyCpL-0P94DZ9jC8fO3-qM8i_usBHocLKho",
    authDomain: "e-library-91790.firebaseapp.com",
    projectId: "e-library-91790",
    storageBucket: "e-library-91790.appspot.com",
    messagingSenderId: "342356785604",
    appId: "1:342356785604:web:a5e83ba511bfd6aa7b8c91"
};

firebase.initializeApp(firebaseConfig);

export default firebase.firestore();