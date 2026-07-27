export class MonsterAI {
    constructor(mesh) {
        this.mesh = mesh;
        this.state = 'patrol';
        this.timer = 0;
        this.targetX = 0;
        this.targetZ = -30;
    }
    update(playerPosition, AudioSystem, volSetting) {
        this.timer++;
        const dist = this.mesh.position.distanceTo(playerPosition);

        if (this.state === 'patrol') {
            if (this.timer % 150 === 0) {
                this.targetX = (Math.random() - 0.5) * 20;
                this.targetZ = playerPosition.z - (Math.random() * 30 + 10);
            }
            this.mesh.position.x += (this.targetX - this.mesh.position.x) * 0.01;
            this.mesh.position.z += (this.targetZ - this.mesh.position.z) * 0.01;

            if (dist < 18) {
                this.state = 'hunt';
                AudioSystem.playScream(volSetting);
                document.getElementById('subtitles').innerText = "БЕГИ ОТ НЕГО!";
            }
        } else if (this.state === 'hunt') {
            this.mesh.lookAt(playerPosition.x, this.mesh.position.y, playerPosition.z);
            this.mesh.position.x += (playerPosition.x - this.mesh.position.x) * 0.015;
            this.mesh.position.z += (playerPosition.z - this.mesh.position.z) * 0.015;

            if (dist < 1.5) {
                alert("SkyWhy уничтожил вас. Попробуйте снова!");
                location.reload();
            }
        }
    }
}
