import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJpOFBrEE7p4EzbZgCMhprC_WCVh-ridQ",
  authDomain: "nobel-prize-winner-cd8e8.firebaseapp.com",
  projectId: "nobel-prize-winner-cd8e8",
  storageBucket: "nobel-prize-winner-cd8e8.appspot.com",
  messagingSenderId: "646081201626",
  appId: "1:646081201626:web:8df6358ac47a77d3f16ce3"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);