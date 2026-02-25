import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { collection, serverTimestamp } from "firebase/firestore";

const db = {};
const auth = getAuth();
const storage = null;
const googleProvider = new GoogleAuthProvider();

export const myQuotesCollection = collection(db, "my-quotes");
export { db, auth, storage, serverTimestamp, googleProvider };
