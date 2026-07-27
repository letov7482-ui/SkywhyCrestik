import { AudioSystem } from '../audio/AudioEngine.js';

export class CaseSystem {
    constructor() {
        // Начальный баланс игрока (сохраняется в браузере Redmi)
        this.coins = parseInt(localStorage.getItem('skywhy_coins')) || 250;
        this.inventory = JSON.parse(localStorage.getItem('skywhy_inventory')) || {
            hasFlashlightPro: false,
            unlockedSkins: ['male_default']
        };

        // Пул наград кейса «Midpoint» с их шансами (в сумме 100%)
        this.caseRewards = [
            { id: 'skin_female_elite', name: 'Elite Female Skin (Эпик!)', chance: 15, type: 'skin' },
            { id: 'skin_midpoint_dark', name: 'Midpoint Dark Cloak (Редкое!)', chance: 25, type: 'skin' },
            { id: 'coins_500', name: 'Мешок монет (+500)', chance: 20, type: 'coins', value: 500 },
            { id: 'battery_pack', name: 'Комплект батареек (х5)', chance: 40, type: 'item' }
        ];

        this.isSpinning = false;
        this.updateUI();
    }

    // Обновление отображения баланса на экране смартфона
    updateUI() {
        const coinCounter = document.getElementById('coin-count-display');
        if (coinCounter) {
            coinCounter.innerText = `💰 МОНЕТЫ: ${this.coins}`;
        }
        // Синхронизируем с общей игровой статистикой в HUD
        const gameStat = document.querySelector('.game-stat');
        if (gameStat && isPlaying) {
            gameStat.innerText = `🔋 ФОНАРИК: ${Math.round(flashlightBattery)}% | 💰 МОНЕТЫ: ${this.coins}`;
        }
    }

    // Сохранение прогресса в память телефона
    saveData() {
        localStorage.setItem('skywhy_coins', this.coins);
        localStorage.setItem('skywhy_inventory', JSON.stringify(this.inventory));
    }

    // Покупка обычных предметов в магазине
    buyItem(itemId, price) {
        if (this.coins < price) {
            this.showNotification("Недостаточно монет для покупки!");
            return false;
        }

        if (itemId === 'flashlight_pro') {
            if (this.inventory.hasFlashlightPro) {
                this.showNotification("Фонарик Pro уже куплен!");
                return false;
            }
            this.inventory.hasFlashlightPro = true;
            this.showNotification("Куплен Фонарик Pro! Дальность +50%");
        } else if (itemId === 'batteries') {
            // Дозаправка батареи (если механика запущена)
            if (window.addBatteries) window.addBatteries(3);
            this.showNotification("Куплены батарейки (х3)");
        }

        this.coins -= price;
        this.saveData();
        this.updateUI();
        return true;
    }

    // ЛОГИКА И АНИМАЦИЯ ПРОКРУТКИ КЕЙСА «MIDPOINT»
    openMidpointCase(casePrice = 100) {
        if (this.isSpinning) return;
        if (this.coins < casePrice) {
            this.showNotification("Нужно 100 монет для открытия кейса!");
            return;
        }

        this.isSpinning = true;
        this.coins -= casePrice;
        this.saveData();
        this.updateUI();

        // Запуск плавного анимированного текста прокрутки в окне магазина
        const shopGrid = document.querySelector('.shop-grid');
        const originalContent = shopGrid.innerHTML;
        
        let ticks = 0;
        const maxTicks = 15;
        
        // Эффект рулетки (как в PUBG / Free Fire)
        const spinInterval = setInterval(() => {
            ticks++;
            // Случайный выбор предмета на каждом "тике" для визуального эффекта
            const randomVisualItem = this.caseRewards[Math.floor(Math.random() * this.caseRewards.length)];
            shopGrid.innerHTML = `
                <div class="shop-item" style="grid-column: 1/-1; border-color: #ff0000; padding: 40px; animation: pulse 0.1s infinite;">
                    <h2 style="color: #ff0000; letter-spacing: 3px;">КРУТКА КЕЙСА...</h2>
                    <p style="font-size: 24px; margin-top: 15px; color: #fff;">🎰 [ ${randomVisualItem.name} ] 🎰</p>
                </div>
            `;
            
            // Воспроизводим звук щелчка рулетки
            if (typeof AudioSystem !== 'undefined') AudioSystem.playClick();

            if (ticks >= maxTicks) {
                clearInterval(spinInterval);
                this.determineFinalReward(shopGrid, originalContent);
            }
        }, 150);
    }

    // Расчет финальной награды по шансам (Drop Rate)
    determineFinalReward(container, originalContent) {
        const rand = Math.random() * 100;
        let cumulativeChance = 0;
        let finalReward = this.caseRewards[this.caseRewards.length - 1]; // Дефолт

        for (const reward of this.caseRewards) {
            cumulativeChance += reward.chance;
            if (rand <= cumulativeChance) {
                finalReward = reward;
                break;
            }
        }

        // Выдача награды в инвентарь
        if (finalReward.type === 'skin') {
            if (!this.inventory.unlockedSkins.includes(finalReward.id)) {
                this.inventory.unlockedSkins.push(finalReward.id);
            }
        } else if (finalReward.type === 'coins') {
            this.coins += finalReward.value;
        }

        this.saveData();
        this.updateUI();
        this.isSpinning = false;

        // Показ экрана победы (Выпавший предмет)
        container.innerHTML = `
            <div class="shop-item" style="grid-column: 1/-1; border-color: #00ff00; padding: 40px;">
                <h2 style="color: #00ff00; text-shadow: 0 0 10px #00ff00;">ВЫ ВЫБИЛИ:</h2>
                <p style="font-size: 26px; font-weight: bold; margin: 20px 0; color: #fff;">${finalReward.name}</p>
                <button id="close-reward-btn" style="background: #00ff00; width: auto; padding: 10px 30px;">ЗАБРАТЬ</button>
            </div>
        `;

        // Звук страшного или эпичного выигрыша
        if (typeof AudioSystem !== 'undefined') AudioSystem.playScream(0.4);

        document.getElementById('close-reward-btn').onclick = () => {
            container.innerHTML = originalContent;
            // Перепривязываем кнопки магазина, так как контент обновился
            window.bindShopButtons(); 
        };
    }

    // Вывод всплывающих уведомлений на экран
    showNotification(text) {
        const subtitleElement = document.getElementById('subtitles');
        if (subtitleElement) {
            subtitleElement.innerText = text;
            subtitleElement.style.color = '#ff3333';
            setTimeout(() => {
                if (subtitleElement.innerText === text) subtitleElement.innerText = "";
            }, 3000);
        }
    }
              }
  
