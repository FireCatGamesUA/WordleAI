let mode = "daily";
let wordLength = 5; // ТУТ ЗАДАЄТЬСЯ КІЛЬКІСТЬ СТОВПЦІВ (літер у слові)
let maxRows = 6;
let targetWord = "";
let board = document.getElementById("board");
let allWords = [];
let currentRow = 0;
let currentColumn = 0;
let btw;
let difficulty = "easy"; // Початкова складність
let time = 300;
let timer = null;
let timeLeft = 0;
let lang = "UA";

async function loadWords() {
    try {
        let response;
        if (lang === "UA") {
            response = await fetch("./ukrainian.txt");
        } else if (lang === "US") {
            response = await fetch("./us.txt");
        } else {
            response = await fetch("./uk.txt");
        }

        const text = await response.text();
        allWords = text
            .split("\n")
            .map(w => w.trim().toLowerCase())
            .filter(w => w.length === wordLength);
        resetGame();
    } catch (e) {
        if (lang === "UA") {
            showMessage("Не вдалося завантажити словник.");
        } else {
            showMessage("Failed to load dictionary.");
        }
    }
}

function pickWord() {
    if (allWords.length === 0) return;
    if (mode === "daily") {
        const date = new Date().toISOString().slice(0, 10);
        const seed = [...date].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
        targetWord = allWords[seed % allWords.length];
    } else {
        targetWord = allWords[Math.floor(Math.random() * allWords.length)];
    }
    btw = targetWord.charAt(0).toUpperCase() + targetWord.slice(1).toLowerCase();
    console.log(btw);
}

function createBoard() {
    board.innerHTML = "";

    const tileSize = 56; // розмір клітинки
    const gapSize = 5; // проміжок між клітинками
    const boardWidth = tileSize * wordLength + gapSize * (wordLength - 1);

    board.style.gridTemplateColumns = `repeat(${wordLength}, 1fr)`;
    board.style.width = boardWidth + "px";

    for (let i = 0; i < wordLength * maxRows; i++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        board.appendChild(tile);
    }
}

function showMessage(msg) {
    const message = document.getElementById("message");
    if (msg === "") return;
    message.innerHTML = msg;
    message.style.display = "flex";
    message.classList.add("show");
    setTimeout(() => {
        message.classList.remove("show");
        message.classList.add("hide");
    }, 2000);
    setTimeout(() => {
        message.style.display = "none";
        message.classList.remove("hide");
    }, 3000);
}

function checkGuess() {
    let guess = "";
    for (let i = currentRow * wordLength; i < (currentRow + 1) * wordLength; i++) {
        guess += board.children[i].textContent.toLowerCase();
    }

    if (guess.length !== wordLength) {
        if(lang == "UA"){
            return showMessage(`Слово має бути з ${wordLength} літер!`);
        }
        else{
            return showMessage(`The word must be ${wordLength} letters long!`);
        }
    }

    if (!allWords.includes(guess)){
        if(lang == "UA"){
            return showMessage("Невідоме слово!");
        }
        else{
            return showMessage("Unknown word!");
        }
    }
    if (currentRow >= maxRows) {
        if(lang == "UA"){
            showMessage("Спроби закінчились!");
        }
        else{
            showMessage("The attempts are over!");
        }
        resetGame();
        return;
    }

    const targetLetters = targetWord.split('');
    const guessLetters = guess.split('');
    const usedTarget = Array(wordLength).fill(false);

    // 1-й прохід: правильні позиції
    guessLetters.forEach((char, i) => {
        const tile = board.children[currentRow * wordLength + i];
        if (char === targetLetters[i]) {
            tile.classList.add("correct");
            usedTarget[i] = true;
            guessLetters[i] = null;
            markKey(char, "correct");
        }
    });

    // 2-й прохід: правильні літери в інших позиціях
    guessLetters.forEach((char, i) => {
        if (char === null) return;
        const tile = board.children[currentRow * wordLength + i];
        let found = false;
        for (let j = 0; j < wordLength; j++) {
            if (!usedTarget[j] && char === targetLetters[j]) {
                found = true;
                usedTarget[j] = true;
                break;
            }
        }
        if (found) {
            tile.classList.add("present");
            markKey(char, "present");
        } else {
            tile.classList.add("absent");
            markKey(char, "absent");
        }
    });

    currentRow++;
    currentColumn = 0;

    if (guess === targetWord) {
        if(lang == "UA"){
            showMessage("Вітаю! Ви вгадали слово."); 
        }
        else{
            showMessage("Congratulations! You guessed the word.");
        }
        resetGame();
    } else if (currentRow === maxRows) {
        if(lang == "UA"){
            showMessage(`Спроби закінчились!<br>Слово було: ${btw}`);  
        }
        else{
            showMessage(`The attempts are over!<br>The word was: ${btw}`);
        }
        resetGame();
    }
}

function markKey(letter, status) {
    const key = [...document.querySelectorAll('.key')]
        .find(k => k.textContent.toLowerCase() === letter);

    if (!key) return;

    if (status === "correct") {
        key.classList.remove("present", "absent");
        key.classList.add("correct");
    } else if (status === "present" && !key.classList.contains("correct")) {
        key.classList.remove("absent");
        key.classList.add("present");
    } else if (status === "absent" &&
        !key.classList.contains("correct") &&
        !key.classList.contains("present")) {
        key.classList.add("absent");
    }
}

function resetGame() {
    document.querySelectorAll(".key").forEach(k => {
        k.classList.remove("correct", "present", "absent");
    });
    pickWord();
    createBoard();
    currentRow = 0;
    currentColumn = 0;
    showMessage("");

    const timerEl = document.getElementById("timerDisplay");
    if (mode === "time") {
        startTimer();  // Запускаємо таймер лише в режимі "time"
        if (timerEl) {
            timerEl.style.opacity = "1";  // Відображаємо таймер в режимі "time"
        }
    } else {
        // Зупиняємо таймер, якщо режим не "time"
        stopTimer();  
        if (timerEl) {
            timerEl.style.opacity = "0";  // Приховуємо таймер для інших режимів
        }
    }
}
function giveUp() {
    if(lang == "UA"){
        showMessage(`Слово було: ${btw}`);
    }
    else{
        showMessage(`The word was: ${btw}`);
    }
    resetGame();
}

const keys = document.querySelectorAll('.key');
keys.forEach(key => {
    key.addEventListener('click', (e) => {
        handleKeyPress(e.target);
    });
});

function handleBackspace() {
    if (currentColumn > 0) {
        currentColumn--;
        const tile = board.children[currentRow * wordLength + currentColumn];
        tile.textContent = '';
    }
}

function handleKeyPress(key) {
    if (key.id === 'backspace') {
        e.preventDefault();  // Це зупинить подальше виконання події
        handleBackspace();
        return;
    }

    if (key.textContent.length === 1 && currentColumn < wordLength) {
        const tile = board.children[currentRow * wordLength + currentColumn];
        tile.textContent = key.textContent;
        currentColumn++;
    }
}


function toggleDifficulty() {
    // Якщо обрано режим "daily", не даємо змінювати складність
    if (mode === "daily") {
        if(lang == "UA"){
            $("#difficulty").text("Заблоковано");
        }
        else{
            $("#difficulty").text("Blocked");
        }
        return;  // Виходимо з функції, щоб не змінювати складність
    }

    // Якщо режим не daily, то можна змінювати складність
    if (difficulty === "easy") {
        difficulty = "normal";
        if(lang == "UA"){
            $("#difficulty").text("Нормально");
        }
        else{
            $("#difficulty").text("Normal");
        }
    } else if (difficulty === "normal") {
        difficulty = "hard";
        if(lang == "UA"){
            $("#difficulty").text("Важко");
        }
        else{
            $("#difficulty").text("Hard");
        }
    } else {
        difficulty = "easy";
        if(lang == "UA"){
            $("#difficulty").text("Легко");
        }
        else{
            $("#difficulty").text("Easy");
        }
    }

    // Встановлюємо час або довжину слова залежно від режиму
    if (mode === "time") {
        // Встановлюємо час залежно від складності
        if (difficulty === "easy") time = 300;
        else if (difficulty === "normal") time = 240;
        else if (difficulty === "hard") time = 180;
    } else {
        // Встановлюємо довжину слова залежно від складності
        if (difficulty === "easy") wordLength = 5;
        else if (difficulty === "normal") wordLength = 7;
        else if (difficulty === "hard") wordLength = 9;
    }

    loadWords();
}

function toggleMode() {
    if (mode === "daily") {
        mode = "endless";
        if(lang == "UA"){
            $("#modeToggle").text("Нескінченна гра");
        }
        else{
            $("#modeToggle").text("Endless game");
        }
    } else if (mode === "endless") {
        mode = "time";
        if(lang == "UA"){
            $("#modeToggle").text("Гра на час");
        }
        else{
            $("#modeToggle").text("Time game");
        }
    } else {
        mode = "daily";
        if(lang == "UA"){
            $("#modeToggle").text("Слово дня");
        }
        else{
            $("#modeToggle").text("Word of the day");
        }
    }

    // Якщо обрано режим "daily", блокуємо можливість вибору складності
    if (mode === "daily") {
        if(lang == "UA"){
            $("#difficulty").text("Заблоковано");
        }
        else{
            $("#difficulty").text("Blocked");
        }
    } else {
        // Якщо режим не daily, то відновлюємо текст складності
        if(difficulty == "easy"){
            if(lang == "UA"){
                $("#difficulty").text("Легко");
            }
            else{
                $("#difficulty").text("Easy");
            }
        }
        else if(difficulty == "normal"){
            if(lang == "UA"){
                $("#difficulty").text("Нормально");
            }
            else{
                $("#difficulty").text("Normal");
            }
        }
        else if(difficulty == "hard"){
            if(lang == "UA"){
                $("#difficulty").text("Важко");
            }
            else{
                $("#difficulty").text("Hard");
            }
        }

        // Оновлюємо кількість літер у слові для нескінченного режиму
        if (mode === "endless") {
            if (difficulty === "easy") wordLength = 5;
            else if (difficulty === "normal") wordLength = 7;
            else if (difficulty === "hard") wordLength = 9;
        } else {
            // При переході на інші режими встановлюємо 5 колонок
            wordLength = 5;
        }
    }

    resetGame();
}


function startTimer() {
    if (mode !== "time") return;  // Якщо режим не "time", не запускаємо таймер

    stopTimer(); // зупиняємо будь-який поточний таймер
    timeLeft = time;
    updateTimerDisplay();
    timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            timer = null; // обов'язково очищаємо таймер після завершення
            if(lang == "UA"){
                showMessage(`Час вийшов! Слово було: ${btw}`);
            }
            else{
                showMessage(`Time is up! The word was: ${btw}`);
            }
            resetGame();  // Тут відбувається скидання гри лише один раз
        } else {
            timeLeft--;
            updateTimerDisplay();
        }
    }, 1000);
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

function updateTimerDisplay() {
    const timerDisplay = document.getElementById("timerDisplay");
    if (timerDisplay) {
        const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const seconds = (timeLeft % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `⏱️ ${minutes}:${seconds}`;
    }
}
function changeLang() {
    if (lang === "UA") {
        lang = "US";
        $("#langToggle").html('<img src="icons/002-united-states.png" alt="US" class="flag-icon"><span class="lang-text">EN</span>');
        $("#giveUpBtn").text("Give up");
        $(".uak").css({"display":"none"});
        $(".enk").css({"display":"flex"});
    } else if (lang === "US") {
        lang = "UK";
        $("#langToggle").html('<img src="icons/003-united-kingdom.png" alt="UK" class="flag-icon"><span class="lang-text">EN</span>');
        $(".uak").css({"display":"none"});
        $(".enk").css({"display":"flex"});
        $("#giveUpBtn").text("Give up");
    } else {
        lang = "UA";
        $("#langToggle").html('<img src="icons/001-ukraine.png" alt="UA" class="flag-icon"><span class="lang-text">UA</span>');
        $("#giveUpBtn").text("Здатися");
        $(".enk").css({"display":"none"});
        $(".uak").css({"display":"grid"});
    }

    // Після зміни мови оновлюємо кнопки складності та режиму
    if (mode === "daily") {
        $("#difficulty").text(lang === "UA" ? "Заблоковано" : "Blocked");
    } else {
        if (difficulty === "easy") {
            $("#difficulty").text(lang === "UA" ? "Легко" : "Easy");
        } else if (difficulty === "normal") {
            $("#difficulty").text(lang === "UA" ? "Нормально" : "Normal");
        } else {
            $("#difficulty").text(lang === "UA" ? "Важко" : "Hard");
        }
    }

    if (mode === "daily") {
        $("#modeToggle").text(lang === "UA" ? "Слово дня" : (lang === "US" ? "Word of the day" : "Word of the day"));
    } else if (mode === "endless") {
        $("#modeToggle").text(lang === "UA" ? "Нескінченна гра" : (lang === "US" ? "Endless game" : "Endless game"));
    } else {
        $("#modeToggle").text(lang === "UA" ? "Гра на час" : (lang === "US" ? "Time game" : "Time game"));
    }

    loadWords(); // завантажити словник і скинути гру
}
loadWords();
