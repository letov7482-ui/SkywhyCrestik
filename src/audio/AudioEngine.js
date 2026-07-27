class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterVolume = 0.8;
        this.ambientInterval = null;
    }

    // Инициализация аудио-контекста (вызывается по первому тачу экрана на Android)
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.startHorrorAmbient();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Изменение общей громкости из настроек меню
    setVolume(value) {
        this.masterVolume = parseFloat(value);
    }

    // 1. ЗВУК ЩЕЛЧКА: Для интерфейса меню и прокрутки кейсов
    playClick() {
        this.init();
        if (this.masterVolume === 0) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(this.masterVolume * 0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    // 2. ЗВУК СКРИМЕРА (КРИК): Оглушающий страшный звук при обнаружении или поимке монстром
    playScream(intensity = 1.0) {
        this.init();
        const finalVolume = this.masterVolume * intensity;
        if (finalVolume === 0) return;

        // Создаем три осциллятора с разными частотами для создания грязного, пугающего диссонанса
        const duration = 1.8;
        const frequencies =;

        frequencies.forEach((freq) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            // 'sawtooth' (пилообразная волна) дает агрессивный, режущий уши звук
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            
            // Частота резко падает вниз, имитируя затухающий вопль
            osc.frequency.linearRampToValueAtTime(45, this.ctx.currentTime + duration);

            gain.gain.setValueAtTime(finalVolume * 0.25, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        });

        // Добавляем низкочастотный подземный гул (удар страха)
        this.playSubBoom(finalVolume);
    }

    // 3. НИЗКОЧАСТОТНЫЙ УДАР: Для эффекта неожиданности
    playSubBoom(volume) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(75, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 0.8);

        gain.gain.setValueAtTime(volume * 0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.8);
    }

    // 4. ФОНОВЫЙ ЭМБИЕНТ ХОРРОРА: Постоянно генерирует мрачную атмосферу
    startHorrorAmbient() {
        if (this.ambientInterval) clearInterval(this.ambientInterval);

        // Каждые 5 секунд запускает случайный гнетущий гул на заднем плане
        this.ambientInterval = setInterval(() => {
            if (this.masterVolume === 0 || !this.ctx) return;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle'; // Мягкая, но давящая волна
            const baseFreq = 40 + Math.random() * 20; // Глубокий бас 40-60 Гц
            
            osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
            // Плавное покачивание частоты для создания эффекта тревоги
            osc.frequency.linearRampToValueAtTime(baseFreq - 5, this.ctx.currentTime + 4.0);

            gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
            // Плавное появление звука из тишины (Fade-in)
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.12, this.ctx.currentTime + 1.5);
            // Плавное затухание (Fade-out)
            gain.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 4.5);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 4.5);
        }, 5000);
    }

    // Остановка всех фоновых звуков при выходе
    stopAll() {
        if (this.ambientInterval) {
            clearInterval(this.ambientInterval);
        }
    }
}

// Экспортируем готовый синглтон-объект для использования во всех модулях
export const AudioSystem = new AudioEngine();
