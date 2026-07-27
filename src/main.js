import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MapBuilder } from './world/MapBuilder.js';
import { MonsterAI } from './ai/MonsterAI.js';
import { CaseSystem } from './shop/CaseSystem.js';
import { MainMenu } from './menu/MainMenu.js';
import { AudioSystem } from './audio/AudioEngine.js';

let scene, camera, renderer;
let mapBuilder, monsterAI, caseSystem, mainMenu;
let monsterMesh; 

let isPlaying = false;
let lastFrameTime = 0;
let moveForward = 0, moveSide = 0;
let touchStartX = 0;

window.flashlightBattery = 100.0;
let isFlashlightOn = true;

const gltfLoader = new GLTFLoader();

function initGame() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020202, 0.08);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);

    mapBuilder = new MapBuilder(scene);
    mapBuilder.build();
    caseSystem = new CaseSystem();

    const spawns = mapBuilder.getSpawnPoints();
    camera.position.copy(spawns.player);

    // Загрузка модели с автоматическим резервным кубом (если файла .gltf еще нет)
    gltfLoader.load('./assets/models/monster.gltf', (gltf) => {
        monsterMesh = gltf.scene;
        monsterMesh.position.copy(spawns.monster);
        monsterMesh.scale.set(1.5, 1.5, 1.5); 
        scene.add(monsterMesh);
        monsterAI = new MonsterAI(monsterMesh);
    }, undefined, () => {
        // Резервный куб монстра, чтобы игра запустилась без ассетов
        const mGeo = new THREE.BoxGeometry(1.2, 2.2, 1.2);
        const mMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        monsterMesh = new THREE.Mesh(mGeo, mMat);
        monsterMesh.position.copy(spawns.monster);
        scene.add(monsterMesh);
        monsterAI = new MonsterAI(monsterMesh);
    });

    const light = new THREE.SpotLight(0xffffff, 4, 35, Math.PI / 5, 0.5, 1);
    camera.add(light);
    camera.add(light.target);
    light.target.position.set(0, 0, -1);
    scene.add(camera);

    mainMenu = new MainMenu(() => {
        isPlaying = true;
    }, null, caseSystem);

    initMobileControls();

    window.addBatteries = (count) => {
        window.flashlightBattery = Math.min(window.flashlightBattery + (count * 20), 100);
        caseSystem.updateUI();
    };

    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = 0;
        setTimeout(() => loader.style.display = 'none', 500);
    }

    requestAnimationFrame(gameLoop);
}

function initMobileControls() {
    const joy = document.getElementById('joystick');
    const stick = document.getElementById('stick');
    
    joy.addEventListener('touchmove', (e) => {
        const rect = joy.getBoundingClientRect();
        const touch = e.touches;
        const x = touch.clientX - rect.left - 50;
        const y = touch.clientY - rect.top - 50;
        const dist = Math.min(Math.sqrt(x*x + y*y), 35);
        const angle = Math.atan2(y, x);
        
        stick.style.transform = `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px)`;
        moveForward = -Math.sin(angle) * (dist / 35) * 0.08;
        moveSide = Math.cos(angle) * (dist / 35) * 0.08;
    });

    joy.addEventListener('touchend', () => {
        stick.style.transform = 'translate(0px, 0px)';
        moveForward = 0; moveSide = 0;
    });

    window.addEventListener('touchstart', (e) => {
        if (!e.target.closest('#joystick') && !e.target.closest('.window') && !e.target.closest('#main-menu')) {
            touchStartX = e.touches.clientX;
        }
    });

    window.addEventListener('touchmove', (e) => {
        if (!e.target.closest('#joystick') && !e.target.closest('.window') && !e.target.closest('#main-menu')) {
            const sens = mainMenu.getSensitivity();
            camera.rotation.y -= (e.touches.clientX - touchStartX) * sens;
            touchStartX = e.touches.clientX;
        }
    });

    const actionBtn = document.getElementById('action-btn');
    if (actionBtn) {
        actionBtn.ontouchstart = () => {
            if (!isPlaying) return;
            AudioSystem.playClick();
            isFlashlightOn = !isFlashlightOn;
            camera.children[0].visible = isFlashlightOn; // Переключаем SpotLight фонарика
        };
    }
}

function gameLoop(timestamp) {
    requestAnimationFrame(gameLoop);
    const fpsLimit = mainMenu ? mainMenu.getFpsTarget() : 60;
    if (timestamp - lastFrameTime < (1000 / fpsLimit)) return;
    
    const delta = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    if (isPlaying) {
        const fpsCounter = document.getElementById('fps-counter');
        if (fpsCounter) {
            fpsCounter.innerText = `FPS: ${Math.round(1000 / delta)}`;
        }

        camera.translateZ(-moveForward);
        camera.translateX(moveSide);
        camera.position.y = 1.6;

        const walls = mapBuilder.getWallMeshes();
        walls.forEach(wall => {
            if (new THREE.Vector2(camera.position.x, camera.position.z).distanceTo(new THREE.Vector2(wall.position.x, wall.position.z)) < 3.4) {
                camera.translateZ(moveForward * 1.2);
                camera.translateX(-moveSide * 1.2);
            }
        });

        if (isFlashlightOn && window.flashlightBattery > 0) {
            window.flashlightBattery -= 0.02;
            caseSystem.updateUI();
            if (window.flashlightBattery <= 0) {
                window.flashlightBattery = 0;
                isFlashlightOn = false;
                camera.children[0].visible = false;
            }
        }

        if (monsterAI && monsterMesh) {
            monsterAI.update(camera.position, AudioSystem, mainMenu.getVolume());
        }
    }

    renderer.render(scene, camera);
}

window.onload = initGame;
window.addEventListener('resize', () => {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
});
