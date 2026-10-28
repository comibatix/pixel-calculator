// 8-битный звуковой движок
const Sound = {
    ctx: null,
    
    // Инициализация (нужна после первого клика пользователя)
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    
    // Универсальная функция для создания тона
    playTone(frequency, duration, type = 'square', volume = 0.1) {
        if (!this.ctx) return;
        
        const oscillator = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        oscillator.type = type; // 'square' даёт 8-битный звук
        oscillator.frequency.value = frequency;
        
        gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        oscillator.start();
        oscillator.stop(this.ctx.currentTime + duration);
    },
    
    // Звук нажатия кнопки (короткий пик)
    click() {
        this.playTone(800, 0.05, 'square', 0.08);
    },
    
    // Звук правильного ответа (восходящая мелодия)
    correct() {
        const now = this.ctx.currentTime;
        [523, 659, 784].forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.15, 'square', 0.1), i * 80);
        });
    },
    
    // Звук ошибки (нисходящий тон)
    error() {
        if (!this.ctx) return;
        const oscillator = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(400, this.ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        oscillator.start();
        oscillator.stop(this.ctx.currentTime + 0.3);
    },
    
    // Звук окончания игры (длинная мелодия)
    gameOver() {
        const notes = [784, 659, 523, 392];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.3, 'square', 0.1), i * 150);
        });
    },
    
    // Звук бонуса (за комбо)
    bonus() {
        const now = this.ctx.currentTime;
        [880, 1108, 1318, 1568].forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.1, 'square', 0.08), i * 50);
        });
    }
};