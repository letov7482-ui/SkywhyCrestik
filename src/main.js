import * as THREE from 'three';
import { MonsterAI } from './ai.js';
import { initMenu } from './menu.js';
import { AudioSystem } from './audio.js';

let scene, camera, renderer, monsterAI, playerModel;
let isPlaying = false, fpsLimit = 60, lastTime = 0;
let moveF = 0, moveS = 0, touchStartX = 0;

function init() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020202, 0.07);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Сглаживание пикселей для Redmi Note 12
    document.body.appendChild(renderer.domElement);

    // Архитектура локации
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 300), new THREE.MeshBasicMaterial({ color: 0x080808 }));
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Персонаж в меню
    playerModel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.8), new THREE.MeshBasicMaterial({ color: 0x4488ff }));
    playerModel.position.set(2, 0.9, -5);
    scene.add(playerModel);

    // Спавн Монстра
    const monsterMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.2, 0.8), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    monsterMesh.position.set(0, 1.1, -35);
    scene.add(monsterMesh);
    monsterAI = new MonsterAI(monsterMesh);

    // Фонарик
    const light = new THREE.SpotLight(0xffffff, 4, 40, Math.PI/5, 0.5, 1);
    camera.add(light);
    camera.add(light.target);
    light.target.position.set(0, 0, -1);
    scene.add(camera);

    initMenu(() => { 
        AudioSystem.init(); 
        isPlaying = true; 
    }, playerModel);
    
    initControls();
    
    document.getElementById('loader').style.opacity = 0;
    setTimeout(() => document.getElementById('loader').style.display = 'none', 500);

    requestAnimationFrame(loop);
}

function initControls() {
    const joy = document.getElementById('joystick');
    const stick = document.getElementById('stick');
    
    joy.addEventListener('touchmove', (e) => {
        const rect = joy.getBoundingClientRect();
        const x = e.touches[0].clientX - rect.left - 50;
        const y = e.touches[0].clientY - rect.top - 50;
        const dist = Math.min(Math.sqrt(x*x + y*y), 35);
        const angle = Math.atan2(y, x);
        stick.style.transform = `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px)`;
        moveF = -Math.sin(angle) * (dist / 35) * 0.08;
        moveS = Math.cos(angle) * (dist / 35) * 0.08;
    });

    joy.addEventListener('touchend', () => {
        stick.style.transform = 'translate(0px, 0px)';
        moveF = 0; moveS = 0;
    });

    window.addEventListener('touchstart', (e) => {
        if(!e.target.closest('#joystick') && !e.target.closest('.window') && !e.target.closest('#main-menu')) {
            touchStartX = e.touches[0].clientX;
        }
    });

    window.addEventListener('touchmove', (e) => {
        if(!e.target.closest('#joystick') && !e.target.closest('.window') && !e.target.closest('#main-menu')) {
            const sens = document.getElementById('set-sens').value * 0.0006;
            camera.rotation.y -= (e.touches[0].clientX - touchStartX) * sens;
            touchStartX = e.touches[0].clientX;
        }
    });
}

function loop(timestamp) {
    requestAnimationFrame(loop);
    fpsLimit = parseInt(document.getElementById('set-fps').value) || 60;
    if (timestamp - lastTime < (1000 / fpsLimit)) return;
    const delta = timestamp - lastTime;
    lastTime = timestamp;

    if (!isPlaying) {
        if(playerModel) playerModel.rotation.y += 0.01;
    } else {
        document.getElementById('fps-counter').innerText = `FPS: ${Math.round(1000 / delta)}`;
        camera.translateZ(-moveF);
        camera.translateX(moveS);
        camera.position.y = 1.6;
        
        const vol = document.getElementById('set-vol').value / 100;
        monsterAI.update(camera.position, AudioSystem, vol);
    }
    renderer.render(scene, camera);
}

window.onload = init;
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
          
