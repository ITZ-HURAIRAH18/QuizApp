document.getElementById("startQuiz").addEventListener("click", startQuiz);
document.getElementById("fileInput").addEventListener("change", handleFile);

let questions = [];
let currentQuestionIndex = 0;
let correctCount = 0;
let totalQuestions = 0;
let timePerQuestion = 0;
let timerInterval;
let optionButtons = [];

function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

        questions = sheet.slice(1).map(row => ({
            number: row[0],
            question: row[1],
            options: [row[2], row[3], row[4], row[5]].filter(opt => opt), 
            correctAnswer: row[6]
        }));

        console.log("Loaded Questions:", questions);
    };
    reader.readAsArrayBuffer(file);
}

function startQuiz() {
    totalQuestions = parseInt(document.getElementById("numQuestions").value);
    timePerQuestion = parseInt(document.getElementById("timePerQuestion").value);

    // Validation: Ensure values are positive integers
    if (!questions.length || isNaN(totalQuestions) || isNaN(timePerQuestion) || totalQuestions <= 0 || timePerQuestion <= 0) {
        alert("Please enter valid positive numbers for questions and time per question.");
        return;
    }

    // Prevent choosing more questions than available
    if (totalQuestions > questions.length) {
        alert(`Only ${questions.length} questions are available. Please enter a valid number.`);
        return;
    }

    // Slice only the needed number of questions
    questions = questions.slice(0, totalQuestions);
    currentQuestionIndex = 0;
    correctCount = 0;

    // Hide the input form
    document.querySelector(".card").classList.add("d-none");

    // Show the quiz section
    document.getElementById("quizContainer").classList.remove("hidden");
    let op = document.getElementById("quizContainer");
    op.style.background = "black";
    op.style.color = "white";

    const optionsContainer = document.getElementById("options");
    optionsContainer.innerHTML = "";
    optionButtons = [];

    if (questions.length > 0) {
        questions[0].options.forEach(() => {
            const btn = document.createElement("button");
            btn.classList.add("btn", "btn-outline-primary", "w-100", "my-2");
            optionsContainer.appendChild(btn);
            optionButtons.push(btn);
        });
    } else {
        alert("No questions found in the Excel file.");
        return;
    }

    showQuestion();
}


function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        clearInterval(timerInterval);
        showResults();
        return;
    }

    const currentQuestion = questions[currentQuestionIndex];

    document.getElementById("questionText").innerText = currentQuestion.question;

    optionButtons.forEach((btn, i) => {
        if (currentQuestion.options[i]) {
            btn.innerText = currentQuestion.options[i];
            btn.classList.remove("correct", "wrong");
            btn.style.display = "block";
            
            btn.onclick = () => checkAnswer(currentQuestion.options[i], currentQuestion.correctAnswer, btn);
        } else {
            btn.style.display = "none";
        }
    });

    startTimer();
}

function startTimer() {
    let timeLeft = timePerQuestion;
    document.getElementById("timeLeft").innerText = timeLeft;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timeLeft").innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            revealCorrectAnswer();
            setTimeout(moveToNextQuestion, 2000);
        }
    }, 1000);
}

function checkAnswer(selectedAnswer, correctAnswer, selectedButton) {
    clearInterval(timerInterval);

    if (String(selectedAnswer) === String(correctAnswer)) {  // Convert both to strings
        selectedButton.classList.add("correct");
        correctCount++;
    } else {
        selectedButton.classList.add("wrong");
        revealCorrectAnswer(); // Ensure correct answer is highlighted
    }

    setTimeout(moveToNextQuestion, 2000);
}

function revealCorrectAnswer() {
    optionButtons.forEach(btn => {
        if (String(btn.innerText) === String(questions[currentQuestionIndex].correctAnswer)) {
            btn.classList.add("correct");
        }
    });
}


function moveToNextQuestion() {
    currentQuestionIndex++;
    showQuestion();
}

function showResults() {
    document.getElementById("quizContainer").classList.add("hidden");
    document.getElementById("resultContainer").classList.remove("hidden");
    document.getElementById("resultContainer").style.background = "black";
    document.getElementById("resultContainer").style.color = "white";

    document.getElementById("resultText").innerText = `You got ${correctCount} out of ${totalQuestions} correct!`;

    // Show the "Retry Quiz" button
    document.getElementById("retryButton").classList.remove("hidden");
}

function restartQuiz() {
    document.getElementById("quizContainer").classList.remove("hidden");
    document.getElementById("resultContainer").classList.add("hidden");
    
    // Reset quiz variables (adjust according to your quiz logic)
    correctCount = 0; // Reset correct count
    currentQuestionIndex = 0; // Reset question index
    loadQuestion(); // Load the first question
}
function validateForm() {
    let isValid = true;

    // Clear previous error messages
    document.getElementById("usernameError").innerText = "";
    document.getElementById("emailError").innerText = "";
    document.getElementById("commentError").innerText = "";

    // Username Validation
    let username = document.getElementById("username").value.trim();
    if (username === "") {
        document.getElementById("usernameError").innerText = "Username is required.";
        isValid = false;
    }

    // Email Validation
    let email = document.getElementById("email").value.trim();
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // Simple email regex
    if (email === "") {
        document.getElementById("emailError").innerText = "Email is required.";
        isValid = false;
    } else if (!emailPattern.test(email)) {
        document.getElementById("emailError").innerText = "Enter a valid email.";
        isValid = false;
    }

    // Comment Validation
    let comment = document.getElementById("comment").value.trim();
    if (comment === "") {
        document.getElementById("commentError").innerText = "Please enter your comments.";
        isValid = false;
    }

    return isValid;  // Prevent form submission if validation fails
}
