import * as THREE from 'three';

export class MapBuilder {
    constructor(scene) {
        this.scene = scene;
        this.walls = [];
        this.spawnPoints = {
            player: new THREE.Vector3(2, 1.6, 2),
            monster: new THREE.Vector3(0, 1.1, -40)
        };
        
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
        this.setupMaterials();
        this.createFloorAndCeiling();
        this.generateGridWalls();
    }

    setupMaterials() {
        // Умная проверка: если текстур физически нет, включаем базовые цвета хоррора
        this.wallMaterial = new THREE.MeshBasicMaterial({ color: 0x141414 });
        this.floorMaterial = new THREE.MeshBasicMaterial({ color: 0x050505 });
        this.ceilingMaterial = new THREE.MeshBasicMaterial({ color: 0x020202 });
        this.pillarMaterial = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });

        // Попытка загрузить текстуры (если файлов нет, Three.js просто проигнорирует это и оставит цвет)
        this.textureLoader.load('./assets/textures/wall.jpg', (tex) => {
            tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
            this.wallMaterial.map = tex; this.wallMaterial.needsUpdate = true;
        }, undefined, () => console.log("Используется стандартный цвет стен"));

        this.textureLoader.load('./assets/textures/floor.jpg', (tex) => {
            tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(2,2);
            this.floorMaterial.map = tex; this.floorMaterial.needsUpdate = true;
        }, undefined, () => console.log("Используется стандартный цвет пола"));
    }

    createFloorAndCeiling() {
        const mapSize = this.mapGrid.length * this.cellSize;

        const floor = new THREE.Mesh(new THREE.PlaneGeometry(mapSize, mapSize), this.floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(mapSize / 2 - this.cellSize / 2, 0, -mapSize / 2 + this.cellSize / 2);
        this.scene.add(floor);

        const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(mapSize, mapSize), this.ceilingMaterial);
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
                    this.spawnPoints.monster.set(xPos, 1.1, zPos);
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
