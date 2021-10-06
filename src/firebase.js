// accessing firebase
import { initializeApp } from 'firebase/app';
import { getDatabase } from "firebase/database";

// Set the configuration for your app
const firebaseConfig = {
	apiKey: "AIzaSyCUGFYAM5PWhvdUkRlCp_HT9m4rvHHSLAM",
	authDomain: "foundit-a9c81.firebaseapp.com",
	databaseURL: "https://foundit-a9c81-default-rtdb.firebaseio.com",
	projectId: "foundit-a9c81",
	storageBucket: "foundit-a9c81.appspot.com",
	messagingSenderId: "519095033795",
	appId: "1:519095033795:web:d0e61730743f3eb9c36776"
};

const app = initializeApp(firebaseConfig);

// Get a reference to the database service
const realtime = getDatabase(app);

export default realtime
