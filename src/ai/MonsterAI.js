export class MonsterAI {
    constructor(mesh) {
        this.mesh = mesh;
        this.state = 'patrol'; // Состояния: patrol (патруль), observe (наблюдение), hunt (охота)
        this.timer = 0;
        this.targetX = 0;
        this.targetZ = -30;
        this.speed = 0.05;
        this.angle = 0;
    }

    // Основной цикл ИИ, который вызывается каждый кадр
    update(playerPosition, AudioSystem, volSetting) {
        this.timer++;
        
        // Считаем точное расстояние между монстром и игроком в 3D пространстве
        const distanceToPlayer = this.mesh.position.distanceTo(playerPosition);

        switch (this.state) {
            case 'patrol':
                this.logicPatrol(playerPosition, distanceToPlayer, AudioSystem, volSetting);
                break;
                
            case 'observe':
                this.logicObserve(playerPosition, distanceToPlayer);
                break;
                
            case 'hunt':
                this.logicHunt(playerPosition, distanceToPlayer);
                break;
        }
    }

    // 1. РЕЖИМ ПАТРУЛИРОВАНИЯ: Монстр бродит по карте и ищет игрока
    logicPatrol(playerPosition, distance, AudioSystem, volSetting) {
        this.speed = 0.03; // Медленный шаг во время патрулирования

        // Каждые 4 секунды (примерно 240 кадров) ИИ сам выбирает новую случайную точку на карте
        if (this.timer % 240 === 0) {
            this.targetX = (Math.random() - 0.5) * 24;
            this.targetZ = playerPosition.z - (Math.random() * 35 + 10);
        }

        // Плавное движение к выбранной случайной точке
        this.mesh.position.x += (this.targetX - this.mesh.position.x) * 0.01;
        this.mesh.position.z += (this.targetZ - this.mesh.position.z) * 0.01;

        // Фишка: Если игрок подошел на 18 метров, монстр замечает его и начинает наблюдать
        if (distance < 18) {
            this.state = 'observe';
            document.getElementById('subtitles').innerText = "*Вы чувствуете, что из темноты за вами кто-то наблюдает...*";
            setTimeout(() => { if(this.state === 'observe') document.getElementById('subtitles').innerText = ""; }, 3000);
        }
    }

    // 2. РЕЖИМ НАБЛЮДЕНИЯ: Монстр замер в темноте, смотрит на игрока и медленно крадется
    logicObserve(playerPosition, distance) {
        this.speed = 0.01; // Почти бесшумное, очень медленное движение

        // Поворачиваем монстра лицом к игроку
        this.mesh.lookAt(playerPosition.x, this.mesh.position.y, playerPosition.z);
        
        // Медленно сокращает дистанцию, двигаясь по направлению к игроку
        this.mesh.position.x += (playerPosition.x - this.mesh.position.x) * 0.003;
        this.mesh.position.z += (playerPosition.z - this.mesh.position.z) * 0.003;

        // Если игрок подошел слишком близко (меньше 8 метров) или попытался убежать — активируется агрессивная охота
        if (distance < 8.0) {
            this.state = 'hunt';
        }
    }

    // 3. РЕЖИМ ОХОТЫ: Монстр бежит напрямую за игроком
    logicHunt(playerPosition, distance) {
        this.speed = 0.07; // Высокая скорость бега

        // Монстр всегда смотрит на игрока
        this.mesh.lookAt(playerPosition.x, this.mesh.position.y, playerPosition.z);

        // Агрессивное преследование по всем осям
        this.mesh.position.x += (playerPosition.x - this.mesh.position.x) * 0.018;
        this.mesh.position.z += (playerPosition.z - this.mesh.position.z) * 0.018;

        document.getElementById('subtitles').innerText = "БЕГИ!!! ОНО ИДЕТ ЗА ТОБОЙ!";

        // Скример: Если монстр догнал игрока (дистанция атаки)
        if (distance < 1.6) {
            this.executeJumpscare();
        }
    }

    // Логика поимки игрока
    executeJumpscare() {
        this.state = 'patrol';
        alert("SkyWhy поймал вас! Разработка Midpoint не прощает ошибок.");
        location.reload(); // Перезапуск игры/сцены
    }
}
