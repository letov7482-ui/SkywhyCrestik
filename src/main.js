import * as THREE from 'three';
import { MapBuilder } from './world/MapBuilder.js';
import { MonsterAI } from './ai/MonsterAI.js';
import { CaseSystem } from './shop/CaseSystem.js';
import { MainMenu } from './menu/MainMenu.js';
import { AudioSystem } from './audio/AudioEngine.js';

// --- ГЛОБАЛЬНЫЕ ИГРОВЫЕ ПЕРЕМЕННЫЕ ---
let scene, camera, renderer;
let mapBuilder, monsterAI, caseSystem, mainMenu;
let playerModel; // Персонаж, отображаемый в главном меню

let isPlaying = false;
let lastFrameTime = 0;
let moveForward = 0, moveSide = 0;
let touchStartX = 0;

// Характеристики игрока внутри матча
window.flashlightBattery = 100.0;
let isFlashlightOn = true;

// Инициализация 3D движка и модулей
function initGame() {
    // 1. Создаем сцену и густой черный туман хоррора
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020202, 0.08);

    // 2. Настраиваем камеру (глаза игрока)
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 0);

    // 3. Высокопроизводительный рендеринг под Android
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Сглаживание пикселей для Redmi Note 12
    document.body.appendChild(renderer.domElement);

    // 4. Инициализируем системы карты, магазина и меню
    mapBuilder = new MapBuilder(scene);
    mapBuilder.build();

    caseSystem = new CaseSystem();

    // Создаем 3D-персонажа для отображения в главном меню (справа)
    const pGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.8);
    const pMat = new THREE.MeshBasicMaterial({ color: 0x4488ff });
    playerModel = new THREE.Mesh(pGeo, pMat);
    playerModel.position.set(2, 0.9, -5);
    scene.add(playerModel);

    // Создаем и спавним ИИ Монстра на его точку из карты
    const mGeo = new THREE.BoxGeometry(0.8, 2.2, 0.8);
    const mMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const monsterMesh = new THREE.Mesh(mGeo, mMat);
    const spawns = mapBuilder.getSpawnPoints();
    monsterMesh.position.copy(spawns.monster);
    scene.add(monsterMesh);
    monsterAI = new MonsterAI(monsterMesh);

    // Переносим игрока на его законную точку спавна
    camera.position.copy(spawns.player);

    // 5. Освещение фонарика, прикрепленное к камере игрока
    const light = new THREE.SpotLight(0xffffff, 4, 35, Math.PI / 5, 0.5, 1);
    camera.add(light);
    camera.add(light.target);
    light.target.position.set(0, 0, -1); // Светит строго вперед, куда смотрим
    scene.add(camera);

    // Подключаем логику главного меню
    mainMenu = new MainMenu(() => {
        isPlaying = true; // Колбэк: срабатывает при нажатии кнопки ИГРАТЬ
    }, playerModel, caseSystem);

    // Настраиваем джойстик и свайпы
    initMobileControls();

    // Функция покупки батареек из CaseSystem связывается с геймплеем
    window.addBatteries = (count) => {
        window.flashlightBattery = Math.min(window.flashlightBattery + (count * 20), 100);
        caseSystem.updateUI();
    };

    // Скрываем экран загрузки
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = 0;
        setTimeout(() => loader.style.display = 'none', 500);
    }

    // Запускаем бесконечный цикл игры
    requestAnimationFrame(gameLoop);
}

// НАСТРОЙКА ТАЧ-УПРАВЛЕНИЯ (ДЛЯ ЭКРАНА СМАРТФОНА)
function initMobileControls() {
    const joy = document.getElementById('joystick');
    const stick = document.getElementById('stick');
    
    // Движение с помощью виртуального джойстика
    joy.addEventListener('touchmove', (e) => {
        const rect = joy.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left - 50;
        const y = touch.clientY - rect.top - 50;
        
        const dist = Math.min(Math.sqrt(x*x + y*y), 35);
        const angle = Math.atan2(y, x);
        
        stick.style.transform = `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px)`;
        
        // Переводим угол джойстика в скорость перемещения 3D камеры
        moveForward = -Math.sin(angle) * (dist / 35) * 0.08;
        moveSide = Math.cos(angle) * (dist / 35) * 0.08;
    });

    joy.addEventListener('touchend', () => {
        stick.style.transform = 'translate(0px, 0px)';
        moveForward = 0; 
        moveSide = 0;
    });

    // Поворот камеры (обзор пальцем по правой части экрана)
    window.addEventListener('touchstart', (e) => {
        if (!e.target.closest('#joystick') && !e.target.closest('.window') && !e.target.closest('#main-menu')) {
            touchStartX = e.touches[0].clientX;
        }
    });

    window.addEventListener('touchmove', (e) => {
        if (!e.target.closest('#joystick') && !e.target.closest('.window') && !e.target.closest('#main-menu')) {
            const sens = mainMenu.getSensitivity();
            const diffX = e.touches[0].clientX - touchStartX;
            camera.rotation.y -= diffX * sens;
            touchStartX = e.touches[0].clientX;
        }
    });

    // Механика кнопки ИСКАТЬ (взаимодействие)
    const actionBtn = document.getElementById('action-btn');
    if (actionBtn) {
        actionBtn.ontouchstart = () => {
            if (!isPlaying) return;
            AudioSystem.playClick();
            // Пример: Переключение фонарика на кнопку действия
            isFlashlightOn = !isFlashlightOn;
            camera.children[0].visible = isFlashlightOn;
        };
    }
}

// ОСНОВНОЙ ИГРОВОЙ ЦИКЛ РЕНДЕРИНГА
function gameLoop(timestamp) {
    requestAnimationFrame(gameLoop);

    // Ограничение кадров (FPS Target) из настроек для экономии заряда батареи Redmi
    const fpsLimit = mainMenu ? mainMenu.getFpsTarget() : 60;
    if (timestamp - lastFrameTime < (1000 / fpsLimit)) return;
    
    const delta = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    if (!isPlaying) {
        // Анимация вращения персонажа на фоне главного меню
        if (playerModel) {
            playerModel.rotation.y += 0.01;
        }
    } else {
        // Выводим счетчик кадров в интерфейс
        const fpsCounter = document.getElementById('fps-counter');
        if (fpsCounter) {
            fpsCounter.innerText = `FPS: ${Math.round(1000 / delta)}`;
        }

        // 1. Движение игрока по лабиринту с учетом разворота камеры
        camera.translateZ(-moveForward);
        camera.translateX(moveSide);
        camera.position.y = 1.6; // Фиксируем высоту глаз человека

        // Простейшая проверка столкновения со стенами из MapBuilder
        const walls = mapBuilder.getWallMeshes();
        walls.forEach(wall => {
            const playerPos2D = new THREE.Vector2(camera.position.x, camera.position.z);
            const wallPos2D = new THREE.Vector2(wall.position.x, wall.position.z);
            
            // Если подошли к центру блока стены ближе чем на 3.4 метра — выталкиваем игрока назад
            if (playerPos2D.distanceTo(wallPos2D) < 3.4) {
                camera.translateZ(moveForward * 1.2);
                camera.translateX(-moveSide * 1.2);
            }
        });

        // 2. Расход батарейки фонарика во время выживания
        if (isFlashlightOn && window.flashlightBattery > 0) {
            window.flashlightBattery -= 0.02; // Медленная разрядка
            caseSystem.updateUI();
            
            if (window.flashlightBattery <= 0) {
                window.flashlightBattery = 0;
                isFlashlightOn = false;
                camera.children[0].visible = false; // Выключаем свет
            }
        }

        // 3. Обновляем адаптивный ИИ монстра SkyWhy
        if (monsterAI) {
            monsterAI.update(camera.position, AudioSystem, mainMenu.getVolume());
        }
    }

    renderer.render(scene, camera);
}

// Запуск при полной загрузке страницы
window.onload = initGame;

// Адаптация под смену ориентации экрана смартфона
window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});
