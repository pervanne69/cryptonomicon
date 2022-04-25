import { createApp } from 'vue'
import App from './App.vue'
import './assets/tailwind.css'


import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCyqNYCORFx---sDnZKrf8MxRK6rTwLjRE",
    authDomain: "cryptonomicon-a5bd6.firebaseapp.com",
    projectId: "cryptonomicon-a5bd6",
    storageBucket: "cryptonomicon-a5bd6.appspot.com",
    messagingSenderId: "521345753657",
    appId: "1:521345753657:web:6536c48895dcf1272a63e8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

createApp(App).mount('#app')
