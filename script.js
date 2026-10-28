// 1. ПОЛУЧЕНИЕ ЭЛЕМЕНТОВ
const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
const problemText = document.getElementById('problemText');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const timerBar = document.getElementById('timerBar');
const recordElement = document.getElementById('record');

// Элементы статуса (комбо, уровень, множитель)
const statusDisplay = document.getElementById('statusDisplay');
const comboElement = document.getElementById('combo');
const levelNameElement = document.getElementById('levelName');
const multiplierElement = document.getElementById('multiplier');
const timeBonusElement = document.getElementById('timeBonus');

// 2. ПЕРЕМЕННЫЕ СОСТОЯНИЯ

// Калькулятор
let currentInput = '0';
let previousInput = '';
let operation = null;
let shouldResetDisplay = false;

// Игра
let score = 0;
let timeLeft = 60;
let timer = null;
let currentProblem = null;
let isPlaying = false;

// Комбо и уровни
let combo = 0;
let level = 0; // 0, 1, 2, 3
let multiplier = 1; // x1, x2, x3, x5

// Настройки уровней
const LEVELS = [
    { name: 'Новичок',  maxNum: 10,  multiplier: 1, timeBonus: 0, emoji: '🟢' },
    { name: 'Разогрет', maxNum: 20,  multiplier: 2, timeBonus: 1, emoji: '🟡' },
    { name: 'В ударе',  maxNum: 50,  multiplier: 3, timeBonus: 2, emoji: '🟠' },
    { name: 'БЕЗУМИЕ',  maxNum: 100, multiplier: 5, timeBonus: 3, emoji: '', includeDiv: true }
];

// 3. ОСНОВНЫЕ ФУНКЦИИ

function updateDisplay() {
    display.textContent = currentInput;
}

function updateStatus() {
    comboElement.textContent = combo;
    
    let newLevel;
    if (combo < 5) newLevel = 0;
    else if (combo < 10) newLevel = 1;
    else if (combo < 20) newLevel = 2;
    else newLevel = 3;
    
    if (newLevel > level) {
        showBonusPopup('⬆️ ' + LEVELS[newLevel].emoji + ' ' + LEVELS[newLevel].name + '!');
        Sound.bonus();
    }
    
    level = newLevel;
    multiplier = LEVELS[level].multiplier;
    
    levelNameElement.textContent = LEVELS[level].emoji + ' ' + LEVELS[level].name;
    multiplierElement.textContent = 'x' + multiplier;
    timeBonusElement.textContent = '+' + LEVELS[level].timeBonus;
    
    statusDisplay.className = 'status-display level-' + level;
}

function showBonusPopup(text) {
    const container = document.querySelector('.game-container');
    const popup = document.createElement('div');
    popup.className = 'bonus-popup';
    popup.textContent = text;
    container.appendChild(popup);
    
    setTimeout(function() {
        popup.remove();
    }, 1500);
}

function generateProblem() {
    const levelConfig = LEVELS[level];
    const maxNum = levelConfig.maxNum;
    
    let operations = ['+', '-', '*'];
    if (levelConfig.includeDiv) {
        operations.push('/');
    }
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2;
    
    if (op === '+') {
        num1 = Math.floor(Math.random() * maxNum) + 1;
        num2 = Math.floor(Math.random() * maxNum) + 1;
    } else if (op === '-') {
        num1 = Math.floor(Math.random() * maxNum) + 5;
        num2 = Math.floor(Math.random() * num1) + 1;
    } else if (op === '*') {
        const mulMax = Math.min(maxNum, 20);
        num1 = Math.floor(Math.random() * mulMax) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
    } else { // деление
        num2 = Math.floor(Math.random() * 10) + 2;
        const result = Math.floor(Math.random() * 10) + 1;
        num1 = num2 * result;
    }
    
    currentProblem = {
        num1: num1,
        num2: num2,
        operation: op,
        answer: eval(num1 + ' ' + op + ' ' + num2)
    };
    
    problemText.textContent = num1 + ' ' + op + ' ' + num2 + ' = ?';
}

function checkAnswer() {
    const playerAnswer = parseFloat(currentInput);
    
    if (playerAnswer === currentProblem.answer) {
        Sound.correct();
        createParticles();
        
        score += 1 * multiplier;
        scoreElement.textContent = score;
        
        combo++;
        updateStatus();
        
        const timeBonus = LEVELS[level].timeBonus;
        if (timeBonus > 0 && isPlaying) {
            timeLeft += timeBonus;
            timerElement.textContent = timeLeft;
            
            const percent = Math.min((timeLeft / 60) * 100, 100);
            timerBar.style.width = percent + '%';
            timerBar.classList.remove('warning', 'critical');
            
            showBonusPopup('+' + timeBonus + ' сек!');
        }
        
        generateProblem();
        currentInput = '0';
        shouldResetDisplay = true;
    } else {
        Sound.error();
        currentInput = 'Error';
        shouldResetDisplay = true;
        updateDisplay();
        
        // Сброс комбо и откат уровня
        combo = 0;
        if (level > 0) {
            level--;
            showBonusPopup('⬇️ Откат уровня!');
        }
        multiplier = 1;
        updateStatus();
        
        // Тряска
        const calculator = document.querySelector('.calculator');
        calculator.classList.add('shake');
        setTimeout(function() {
            calculator.classList.remove('shake');
        }, 500);
        
        setTimeout(function() {
            if (currentInput === 'Error') {
                currentInput = '0';
                shouldResetDisplay = true;
                updateDisplay();
            }
        }, 1000);
    }
    updateDisplay();
}

function calculate() {
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    
    if (isNaN(prev) || isNaN(current)) return;
    
    let result;
    if (operation === '+') result = prev + current;
    else if (operation === '-') result = prev - current;
    else if (operation === '*') result = prev * current;
    else if (operation === '/') result = current !== 0 ? prev / current : 'Error';
    else return;
    
    currentInput = result.toString();
    shouldResetDisplay = true;
}

// 4. УПРАВЛЕНИЕ ИГРОЙ

function startGame() {
    Sound.init();
    
    score = 0;
    timeLeft = 60;
    isPlaying = true;
    combo = 0;
    level = 0;
    multiplier = 1;
    
    scoreElement.textContent = score;
    timerElement.textContent = timeLeft;
    startBtn.disabled = true;
    startBtn.textContent = 'ИГРА...';
    
    timerBar.style.width = '100%';
    timerBar.classList.remove('warning', 'critical');
    
    updateStatus();
    generateProblem();
    
    timer = setInterval(function() {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        const percent = (timeLeft / 60) * 100;
        timerBar.style.width = percent + '%';
        
        if (timeLeft <= 10) {
            timerBar.classList.add('critical');
            timerBar.classList.remove('warning');
        } else if (timeLeft <= 20) {
            timerBar.classList.add('warning');
        }
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    Sound.gameOver();
    isPlaying = false;
    clearInterval(timer);
    
    const isNewRecord = saveRecord();
    
    if (isNewRecord) {
        problemText.textContent = '🎉 НОВЫЙ РЕКОРД: ' + score + '!';
        Sound.bonus();
    } else {
        problemText.textContent = 'Игра окончена! Очки: ' + score;
    }
    
    startBtn.disabled = false;
    startBtn.textContent = 'ЗАНОВО';
    
    currentInput = '0';
    updateDisplay();
}


// 5. ВИЗУАЛЬНЫЕ ЭФФЕКТЫ

function createParticles() {
    const container = document.querySelector('.game-container');
    const calculator = document.querySelector('.calculator');
    
    const calcRect = calculator.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    const startX = calcRect.left - containerRect.left + calcRect.width / 2;
    const startY = calcRect.top - containerRect.top + 20;
    
    const particleCount = 20 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        particle.style.left = startX + 'px';
        particle.style.top = startY + 'px';
        
        const angle = -Math.PI + (Math.PI * i) / (particleCount - 1);
        const velocity = 100 + Math.random() * 150;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        
        const colors = ['#9bbc0f', '#f0e68c', '#ffffff', '#32cd32', '#adff2f', '#ffd700', '#ff6b6b'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        const size = 6 + Math.random() * 10;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        container.appendChild(particle);
        
        setTimeout(function() {
            particle.remove();
        }, 800);
    }
}


// 6. ОБРАБОТЧИКИ СОБЫТИЙ

buttons.forEach(function(button) {
    button.addEventListener('click', function() {
        const value = button.textContent;
        
        if (!isPlaying) return;
        Sound.click();
        
        if ((value >= '0' && value <= '9') || value === '.') {
            if (currentInput === 'Error') {
                currentInput = value;
                shouldResetDisplay = false;
            } else if (shouldResetDisplay) {
                currentInput = value;
                shouldResetDisplay = false;
            } else {
                if (currentInput === '0' && value !== '.') {
                    currentInput = value;
                } else {
                    currentInput = currentInput + value;
                }
            }
        }
        else if (value === '+' || value === '-' || value === '*' || value === '/') {
            if (operation !== null && !shouldResetDisplay) {
                calculate();
            }
            previousInput = currentInput;
            operation = value;
            shouldResetDisplay = true;
        }
        else if (value === '=') {
            if (operation !== null) {
                calculate();
                operation = null;
            }
            checkAnswer();
        }
        
        updateDisplay();
    });
});

// Отдельный обработчик для кнопки "C"
const clearButton = document.querySelector('.clear');
if (clearButton) {
    clearButton.addEventListener('click', function() {
        currentInput = '0';
        previousInput = '';
        operation = null;
        shouldResetDisplay = false;
        updateDisplay();
    });
}

// Поддержка клавиатуры
document.addEventListener('keydown', function(event) {
    if (!isPlaying) return;
    
    const key = event.key;
    
    if (key >= '0' && key <= '9') {
        document.querySelectorAll('.btn').forEach(function(btn) {
            if (btn.textContent === key) btn.click();
        });
    }
    else if (key === '+' || key === '-' || key === '*' || key === '/') {
        document.querySelectorAll('.btn').forEach(function(btn) {
            if (btn.textContent === key) btn.click();
        });
    }
    else if (key === '.' || key === ',') {
        document.querySelectorAll('.btn').forEach(function(btn) {
            if (btn.textContent === '.') btn.click();
        });
    }
    else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        const equalsBtn = document.querySelector('.equals');
        if (equalsBtn && !equalsBtn.dataset.clicked) {
            equalsBtn.dataset.clicked = 'true';
            equalsBtn.click();
            setTimeout(function() { equalsBtn.dataset.clicked = ''; }, 100);
        }
    }
    else if (key === 'Backspace') {
        // Backspace удаляет последний символ или сбрасывает в 0
        if (currentInput.length > 1 && currentInput !== 'Error') {
            currentInput = currentInput.slice(0, -1);
        } else {
            currentInput = '0';
        }
        updateDisplay();
    }
    else if (key === 'Escape' || key === 'c' || key === 'C' || key === 'с' || key === 'С') {
        if (clearButton) clearButton.click();
    }
});

startBtn.addEventListener('click', startGame);


// 7. РЕКОРД И ИНИЦИАЛИЗАЦИЯ

function loadRecord() {
    const saved = localStorage.getItem('pixelCalcRecord');
    if (saved) {
        recordElement.textContent = saved;
    }
}

function saveRecord() {
    const currentRecord = parseInt(localStorage.getItem('pixelCalcRecord')) || 0;
    if (score > currentRecord) {
        localStorage.setItem('pixelCalcRecord', score);
        recordElement.textContent = score;
        return true;
    }
    return false;
}

loadRecord();
updateStatus();
updateDisplay();