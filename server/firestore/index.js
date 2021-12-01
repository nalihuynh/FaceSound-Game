const firebase = require('firebase/compat/app');

require('firebase/compat/auth');
require('firebase/compat/firestore');

const firebaseConfig = {

    apiKey: "AIzaSyCKEUeIuTFsaW4zAEUj-i8znwI2sFsgNFE",
  
    authDomain: "facesound-ef406.firebaseapp.com",
  
    projectId: "facesound-ef406",
  
    storageBucket: "facesound-ef406.appspot.com",
  
    messagingSenderId: "472340966037",
  
    appId: "1:472340966037:web:c963d9563ec83c52c8099c"
  
};   

firebase.initializeApp(firebaseConfig);

/**
 * @brief Adds given name and score to Firestore collection
 * @param name Name of player (as string)
 * @param score Score of player (as number)
 */
const submitHighScore = (name, score) => {
    if (isNaN(score)) throw new Error("Score must be a numerical value!");
    firebase.firestore().collection("HighScores").add(
        {
            playerName: name,
            score: score,
            date: Date.now()
        }
    )
}

/**
 * @brief Retrieves high score list in descending order of score 
 *        and ascending order of date (later = lower)
 * 
 * @returns Promise resulting in array (if successful)
 *          containing data of shape:
 *          { playerName: [name: string], score: [score: number],
 *            date: [date: numerical result of Date.now()] }
 * 
 * @note use .then(res => {}) callback to retrieve high score list from result
 */
const getHighScores = async () => {
    const query = await firebase.firestore().collection("HighScores")
                            .orderBy('score', 'desc')
                            .orderBy('date', 'asc').get();
    return query.docs.map(doc => doc.data());
}

module.exports.submitHighScore = submitHighScore;
module.exports.getHighScores = getHighScores;
module.exports.default = firebase;