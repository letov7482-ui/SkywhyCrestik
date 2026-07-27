import { AudioSystem } from '../audio/AudioEngine.js';

export class MainMenu {
    constructor(onStartGame, playerModel, caseSystem) {
        this.onStartGame = onStartGame;
        this.playerModel = playerModel;
        this.caseSystem = caseSystem;
        this.windows = ['win-settings', 'win-shop', 'win-notif'];
        
        this.initElements();
        this.bindEvents();
        this.setupGlobalBindings();
    }

    // Поиск элементов интерфейса на экране смартфона
    initElements() {
        this.btnSettings = document.getElementById('btn-settings');
        this.btnShop = document.getElementById('btn-shop');
        this.btnNotif = document.getElementById('btn-notif');
        this.btnStart = document.getElementById('start-btn');
        
        this.setGender = document.getElementById('set-gender');
        this.setFps = document.getElementById('set-fps');
        this.setSens = document.getElementById('set-sens');
        this.setVol = document.getElementById('set-vol');
    }

    // Привязка мобильных тач-событий к логике хоррора SkyWhy
    bindEvents() {
        this.btnSettings.onclick = () => this.openWindow('win-settings');
        this.btnShop.onclick = () => this.openWindow('win-shop');
        this.btnNotif.onclick = () => this.openWindow('win-notif');
        
        // Закрытие окон на крестик [X]
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.onclick = () => this.closeAllWindows();
        });

        // Кастомизация: Смена пола персонажа на женский/мужской
        this.setGender.onchange = (e) => this.handleGenderChange(e.target.value);

        // Кнопка СТАРТ игры
        this.btnStart.onclick = () => this.handleStartGame();

        // Слайдер громкости криков монстра
        this.setVol.oninput = (e) => {
            const vol = parseFloat(e.target.value) / 100;
            AudioSystem.setVolume(vol);
        };
    }

    // Глобальные привязки для динамически обновляемого контента (например, после открытия кейса)
    setupGlobalBindings() {
        window.bindShopButtons = () => {
            const caseBtn = document.querySelector('.shop-item button');
            if (caseBtn && this.caseSystem) {
                caseBtn.onclick = () => this.caseSystem.openMidpointCase(100);
            }
        };
        window.bindShopButtons();
    }

    openWindow(id) {
        this.closeAllWindows();
        const win = document.getElementById(id);
        if (win) {
            win.style.display = 'block';
            AudioSystem.playClick();
        }
    }

    closeAllWindows() {
        this.windows.forEach(id => {
            const win = document.getElementById(id);
            if (win) win.style.display = 'none';
        });
    }

    // Фишка: изменение параметров 3D-модели в реальном времени при смене скина/пола
    handleGenderChange(gender) {
        if (!this.playerModel) return;
        
        const subtitle = document.getElementById('subtitles');
        if (gender === 'female') {
            this.playerModel.material.color.setHex(0xff88aa); // Элегантный женский скин
            if (subtitle) subtitle.innerText = "Midpoint: Выбран женский персонаж";
        } else {
            this.playerModel.material.color.setHex(0x4488ff); // Классический мужской скин
            if (subtitle) subtitle.innerText = "Midpoint: Выбран мужской персонаж";
        }
        
        AudioSystem.playClick();
        setTimeout(() => { if (subtitle) subtitle.innerText = ""; }, 2000);
    }

    // Запуск основного игрового процесса
    handleStartGame() {
        this.closeAllWindows();
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('game-ui').style.display = 'block';
        
        // Включаем аудио-движок и воспроизводим стартовый эмбиент-гул
        AudioSystem.init();
        AudioSystem.playScream(0.7);
        
        // Сигнал ядру main.js, что пора включать управление игроком и ИИ монстра
        this.onStartGame();
    }

    // Геттеры настроек для передачи в основной цикл рендеринга (main.js)
    getFpsTarget() {
        return parseInt(this.setFps.value) || 60;
    }

    getSensitivity() {
        return (parseFloat(this.setSens.value) || 5) * 0.0006;
    }
}
