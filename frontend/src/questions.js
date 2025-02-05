const questionP = document.querySelector("#question");
const answerContainer = document.querySelector("#answer-container");
const nextButton = document.querySelector("#next");

const timer = document.createElement("div");
timer.id = "timer";
timer.textContent = "30";
document.body.insertBefore(timer, document.querySelector("#buttons-section"));

let time = 30;
let timerInterval;
let correctAnswer = '';  
let selectedAnswer = '';
let isProcessing = false;  

document.addEventListener("DOMContentLoaded", fetchQuestion);
nextButton.addEventListener("click", handleNext);

async function fetchQuestion() {
    if (isProcessing) return;
    isProcessing = true;

    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.log("No token found");
            return;
        }

        const response = await fetch("https://learnifybackend-wvnw.onrender.com/users/currentq/", {
            headers: { authorization: token }
        });

        if (!response.ok) throw new Error("No question fetched");

        const data = await response.json();

        if (!data || Object.keys(data).length === 0) {  
            console.log("No more questions left. Redirecting to mystery.html...");
            await resetPoints(); // Reset points for the next round
            window.location.href = 'mystery.html';  // Redirect
            return;
        }

        questionP.textContent = data.question;
        correctAnswer = data.correct_answer;
        loadAnswers(data);
        startTimer();
    } catch (err) {
        console.log(err);
        questionP.textContent = "Failed to load";
    }

    isProcessing = false;
}

function loadAnswers(data) {
    const options = ["a", "b", "c", "d"];
    options.forEach((option, index) => {
        const answerValue = data["option_" + option];
        answerContainer.children[index].innerHTML = `<input type="radio" name="question" value="${answerValue}"> ${answerValue}`;
    });
}

function startTimer() {
    time = 30;
    timer.textContent = time;
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        time--;
        timer.textContent = time;
        if (time <= 0) {
            clearInterval(timerInterval);
            alert(`Time's up! The correct answer is: ${correctAnswer}`); // Show correct answer
            handleNext();  
        }
    }, 1000);
}

async function handleNext() {
    if (isProcessing) return;  

    const selectedOption = document.querySelector('input[name="question"]:checked');  
    if (!selectedOption) {
        console.log("No selection");
        return;
    }

    selectedAnswer = selectedOption.value;
    console.log("Clicked on:", selectedAnswer);
    console.log("Right answ:", correctAnswer);

    if (selectedAnswer === correctAnswer) {
        await updatePoints();  
    } else {
        console.log(`Incorrect answer selected. Correct answer was: ${correctAnswer}`);
        alert(`The correct answer is: ${correctAnswer}`);  // Show the correct answer if wrong
    }

    fetchQuestion();  
}

async function updatePoints() {
    try {
        console.log("Wait to update points");

        const token = localStorage.getItem("token");
        if (!token) return console.log("No token found.");

        const response = await fetch('https://learnifybackend-wvnw.onrender.com/users/update-points', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token  
            },
            body: JSON.stringify({ login_id: localStorage.getItem('login_id') })
        });

        if (response.ok) {
            const updatedData = await response.json();
            console.log("Points updated:", updatedData);
        } else {
            console.log("error");
        }
    } catch (e) {
        console.log(e);
    }
}

async function resetPoints() {
    try {
        console.log("Resetting points...");
        const token = localStorage.getItem("token");
        if (!token) return console.log("No token found.");

        await fetch('https://learnifybackend-wvnw.onrender.com/users/reset-points', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem("token")
            },
            body: JSON.stringify({ login_id: localStorage.getItem('login_id') })
        });
    } catch (e) {
        console.log(e);
    }
}
