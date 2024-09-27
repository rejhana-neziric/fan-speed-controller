// Import Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBz3Yxxu2b4UET0n32JK806GhTWxyesUg4",
    authDomain: "iot-project-c659d.firebaseapp.com",
    databaseURL: "https://iot-project-c659d-default-rtdb.firebaseio.com",
    projectId: "iot-project-c659d",
    storageBucket: "iot-project-c659d.appspot.com",
    messagingSenderId: "493564845918",
    appId: "1:493564845918:web:fa9afe26ecd8fc271439cf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Import Firebase Database functions
import { getDatabase, ref, set, child, update, remove, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Initialize Database
const db = getDatabase();

const currentTemperature = document.getElementById("currentTemperature");
const tresholdTemperature1 = document.getElementById("tresholdTemp1");
const tresholdTemperature2 = document.getElementById("tresholdTemp2");
const toggleButton = document.getElementById('toggleButton');
const levels = [...document.querySelectorAll(".level")];
let speed = 0;
let isToggled = false;

 // Function to get data from Firebase based on provided paths
function getData(paths, callback) {
    const dbref = ref(db);
    const promises = paths.map(path => get(child(dbref, path))); 

    Promise.all(promises)
        .then(snapshots => {
            const data = {};
            snapshots.forEach((snapshot, index) => {
                if (snapshot.exists()) {
                    data[paths[index]] = snapshot.val().value;
                }
            });
            callback(data); 
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
            messageError("Error fetching data.");
        });
}

// Inserts or updates data in Firebase
function insertData(path, data) {
    set(ref(db, path), { value: data })
        .then(() => {
            messageSuccess("Data saved successfully.");
        })
        .catch((error) => {
            console.error("Error saving data:", error);
            messageError("Error saving data.");
        });
}

// Update the level color based on the current speed.
function levelsColor() {
    levels.forEach(level => level.style.backgroundColor = '#ffffff'); 

    if (speed === 1) {
        document.getElementById("speed1").style.backgroundColor = '#84a1b8';
    } else if (speed === 2) {
        document.getElementById("speed2").style.backgroundColor = '#84a1b8';
    } else if (speed === 3) {
        document.getElementById("speed3").style.backgroundColor = '#84a1b8';
    }
}

// Displays a message in the UI
function message(messageContent, className) {
    if (!messageContent) return;

    let messageContainerDiv = document.getElementById("messageContainerDiv");
    if (!messageContainerDiv) {
        messageContainerDiv = document.createElement("div");
        messageContainerDiv.id = "messageContainerDiv";
        document.body.appendChild(messageContainerDiv);
    }

    const messageDiv = document.createElement("div");
    messageDiv.classList.add(className);
    messageDiv.innerHTML = messageContent;
    messageContainerDiv.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => messageDiv.remove(), 1000);
    }, 4000);
}

// Shortcut for success and error messages
function messageSuccess(messageContent) { message(messageContent, "messageSuccess"); }
function messageError(messageContent) { message(messageContent, "messageError"); }

// Function to handle toggle button functionality
let toggleDebounce;
function toggle() {
    isToggled = !isToggled;
    toggleButton.textContent = isToggled ? 'ON' : 'OFF';

    clearTimeout(toggleDebounce); 
    toggleDebounce = setTimeout(() => {
        insertData("Fan", isToggled);  
    }, 300);  
}

toggleButton.addEventListener('click', toggle);  

// Save threshold 1 to Firebase after validation
document.getElementById("btnSaveTresholdTemp1").addEventListener("click", function () {
    const tempC = Number(tresholdTemperature1.value);
    if (tempC < Number(tresholdTemperature2.value)) {
        insertData("Treshold1", tempC);
    } else {
        messageError("Treshold 1 cannot be higher than Treshold 2.");
    }
});

// Save threshold 2 to Firebase after validation
document.getElementById("btnSaveTresholdTemp2").addEventListener("click", function () {
    const tempC = Number(tresholdTemperature2.value);
    if (tempC > Number(tresholdTemperature1.value)) {
        insertData("Treshold2", tempC);
    } else {
        messageError("Treshold 2 cannot be lower than Treshold 1.");
    }
});

// Fetches initial data from Firebase and updates the UI accordingly
window.onload = function () {
    getData(["Sensor", "Treshold1", "Treshold2", "Fan"], (data) => {
        currentTemperature.value = data.Sensor || "";
        tresholdTemperature1.value = data.Treshold1 || "";
        tresholdTemperature2.value = data.Treshold2 || "";
        isToggled = data.Fan || false;
        toggleButton.textContent = isToggled ? 'ON' : 'OFF';
    });
};

// Set intervals to update sensor and speed data, and adjust levels color
setInterval(function () {
    getData(["Sensor", "Speed"], (data) => {
        currentTemperature.value = data.Sensor || "";
        speed = data.Speed || 0;
        levelsColor(); 
    });
}, 1000);  