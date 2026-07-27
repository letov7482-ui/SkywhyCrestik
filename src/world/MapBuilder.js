import * as THREE from 'three';

export class MapBuilder {
    constructor(scene) {
        this.scene = scene;
        this.walls = []; // Массив для просчета будущих столкновений (коллизий)
        this.spawnPoints = {
            player: new THREE.Vector3(0, 1.6, 0),
            monster: new THREE.Vector3(0, 1.1, -40)
        };
        
        // Карта лабиринта в виде сетки (0 - пусто, 1 - стена, 2 - спавн монстра)
        this.mapGrid = [,
 ,
 ,
 ,
 ,
 ,
 ,
 ,
 ,
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
        
        this.cellSize = 6; // Размер одного блока лабиринта в метрах
    }

    // Главный метод сборки 3D мира SkyWhy
    build() {
        this.createFloorAndCeiling();
        this.createMaterials();
        this.generateGridWalls();
    }

    // Создание пола и потолка для создания ощущения замкнутого пространства хоррора
    createFloorAndCeiling() {
        const mapSize = this.mapGrid.length * this.cellSize;

        // Пол (очень темный матовый пластик/бетон)
        const floorGeo = new THREE.PlaneGeometry(mapSize, mapSize);
        const floorMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(mapSize / 2 - this.cellSize / 2, 0, -mapSize / 2 + this.cellSize / 2);
        this.scene.add(floor);

        // Потолок (блокирует верхний свет, делая мир абсолютно черным)
        const ceilingGeo = new THREE.PlaneGeometry(mapSize, mapSize);
        const ceilingMat = new THREE.MeshBasicMaterial({ color: 0x020202 });
        const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.set(mapSize / 2 - this.cellSize / 2, 5, -mapSize / 2 + this.cellSize / 2);
        this.scene.add(ceiling);
    }

    // Оптимизированные материалы (MeshBasicMaterial быстрее всего рендерится на Android)
    createMaterials() {
        this.wallMaterial = new THREE.MeshBasicMaterial({ color: 0x141414 });
        this.pillarMaterial = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
    }

    // Генерация стен на основе сетки лабиринта
    generateGridWalls() {
        const wallGeo = new THREE.BoxGeometry(this.cellSize, 5, this.cellSize);

        for (let r = 0; r < this.mapGrid.length; r++) {
            for (let c = 0; c < this.mapGrid[r].length; c++) {
                const cellType = this.mapGrid[r][c];
                
                // Рассчитываем 3D координаты для каждого блока
                const xPos = c * this.cellSize;
                const zPos = -r * this.cellSize;

                if (cellType === 1) {
                    // Ставим глухую стену лабиринта
                    const wallMesh = new THREE.Mesh(wallGeo, this.wallMaterial);
                    wallMesh.position.set(xPos, 2.5, zPos);
                    this.scene.add(wallMesh);
                    
                    // Сохраняем в массив для обработки коллизий игрока
                    this.walls.push(wallMesh);
                    
                    // Фишка: декоративные угловые колонны для красоты архитектуры
                    this.addPillarDecoration(xPos, zPos);
                } 
                else if (cellType === 2) {
                    // Запоминаем точку спавна монстра из сетки карты
                    this.spawnPoints.monster.set(xPos, 1.1, zPos);
                }
            }
        }
        
        // Фишка от себя: расстановка пугающего аварийного освещения
        this.addHorrorLights();
    }

    // Добавление колонн по углам блоков для объема графики без просадки FPS
    addPillarDecoration(x, z) {
        const pillarGeo = new THREE.BoxGeometry(0.6, 5, 0.6);
        const offsets = [-3, 3];
        
        offsets.forEach(ox => {
            offsets.forEach(oz => {
                const pillar = new THREE.Mesh(pillarGeo, this.pillarMaterial);
                pillar.position.set(x + ox * 0.9, 2.5, z + oz * 0.9);
                this.scene.add(pillar);
            });
        });
    }

    // Фишка: создание редких, тусклых ламп, которые будут жутко мигать
    addHorrorLights() {
        // Ставим одну контрольную аварийную лампу в центре лабиринта
        const lightPos = new THREE.Vector3(24, 4.8, -24);
        
        // Визуальный корпус лампы
        const lampGeo = new THREE.CylinderGeometry(0.2, 0.3, 0.2);
        const lampMat = new THREE.MeshBasicMaterial({ color: 0xff3333 });
        const lamp = new THREE.Mesh(lampGeo, lampMat);
        lamp.position.copy(lightPos);
        this.scene.add(lamp);

        // Реальный источник красного света (PointLight)
        const redLight = new THREE.PointLight(0xff0000, 1.5, 12);
        redLight.position.copy(lightPos);
        redLight.position.y -= 0.2;
        this.scene.add(redLight);

        // Запускаем цикл мерцания лампы для нагнетания атмосферы Midpoint
        setInterval(() => {
            if (Math.random() > 0.4) {
                redLight.intensity = Math.random() * 2.0;
                lamp.material.color.setHex(0xff3333);
            } else {
                redLight.intensity = 0.1;
                lamp.material.color.setHex(0x330000); // Лампа затухает
            }
        }, 150);
    }

    // Возврат точек спавна для правильного размещения персонажей при старте
    getSpawnPoints() {
        return this.spawnPoints;
    }

    // Возврат массива стен для проверки столкновений игрока (чтобы не ходить сквозь стены)
    getWallMeshes() {
        return this.walls;
    }
}
