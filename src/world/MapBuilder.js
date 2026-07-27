import * as THREE from 'three';

export class MapBuilder {
    constructor(scene) {
        this.scene = scene;
        this.walls = [];
        this.spawnPoints = {
            player: new THREE.Vector3(2, 1.6, 2),
            monster: new THREE.Vector3(0, 1.1, -40)
        };
        
        // Текстурный загрузчик Three.js
        this.textureLoader = new THREE.TextureLoader();
        
        this.mapGrid = [,
 ,
 ,
 ,
 ,
 ,
 ,
 ,
 ,
            [1,1,1,1,1,1,1,1,1,1]
        ];
        
        this.cellSize = 6;
    }

    build() {
        this.loadHorrorTextures();
        this.createFloorAndCeiling();
        this.generateGridWalls();
    }

    // Заранее настраиваем пути к будущим картинкам
    loadHorrorTextures() {
        // Загружаем текстуру стены, пола и потолка из папки assets
        this.wallTex = this.textureLoader.load('./assets/textures/wall.jpg');
        this.floorTex = this.textureLoader.load('./assets/textures/floor.jpg');
        this.ceilTex = this.textureLoader.load('./assets/textures/ceiling.jpg');

        // Настройка повторения текстур, чтобы они не растягивались, а ложились ровно
        [this.wallTex, this.floorTex, this.ceilTex].forEach(tex => {
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
        });
        
        this.wallTex.repeat.set(1, 1);
        this.floorTex.repeat.set(2, 2);
        this.ceilTex.repeat.set(2, 2);

        // Создаем красивые материалы на основе твоих картинок
        this.wallMaterial = new THREE.MeshBasicMaterial({ map: this.wallTex });
        this.floorMaterial = new THREE.MeshBasicMaterial({ map: this.floorTex });
        this.ceilingMaterial = new THREE.MeshBasicMaterial({ map: this.ceilTex });
        this.pillarMaterial = new THREE.MeshBasicMaterial({ color: 0x0a0a0a }); // Темные колонны
    }

    createFloorAndCeiling() {
        const mapSize = this.mapGrid.length * this.cellSize;

        // Пол с текстурой
        const floorGeo = new THREE.PlaneGeometry(mapSize, mapSize);
        const floor = new THREE.Mesh(floorGeo, this.floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(mapSize / 2 - this.cellSize / 2, 0, -mapSize / 2 + this.cellSize / 2);
        this.scene.add(floor);

        // Потолок с текстурой
        const ceilingGeo = new THREE.PlaneGeometry(mapSize, mapSize);
        const ceiling = new THREE.Mesh(ceilingGeo, this.ceilingMaterial);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.set(mapSize / 2 - this.cellSize / 2, 5, -mapSize / 2 + this.cellSize / 2);
        this.scene.add(ceiling);
    }

    generateGridWalls() {
        const wallGeo = new THREE.BoxGeometry(this.cellSize, 5, this.cellSize);

        for (let r = 0; r < this.mapGrid.length; r++) {
            for (let c = 0; c < this.mapGrid[r].length; c++) {
                const cellType = this.mapGrid[r][c];
                const xPos = c * this.cellSize;
                const zPos = -r * this.cellSize;

                if (cellType === 1) {
                    const wallMesh = new THREE.Mesh(wallGeo, this.wallMaterial);
                    wallMesh.position.set(xPos, 2.5, zPos);
                    this.scene.add(wallMesh);
                    this.walls.push(wallMesh);
                    this.addPillarDecoration(xPos, zPos);
                } 
                else if (cellType === 2) {
                    this.spawnPoints.monster.set(xPos, 0, zPos); // ИИ монстра встанет на уровень пола
                }
            }
        }
        this.addHorrorLights();
    }

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

    addHorrorLights() {
        const lightPos = new THREE.Vector3(24, 4.8, -24);
        const redLight = new THREE.PointLight(0xff0000, 1.5, 12);
        redLight.position.copy(lightPos);
        this.scene.add(redLight);

        setInterval(() => {
            redLight.intensity = Math.random() > 0.4 ? Math.random() * 2.0 : 0.1;
        }, 150);
    }

    getSpawnPoints() { return this.spawnPoints; }
    getWallMeshes() { return this.walls; }
}
