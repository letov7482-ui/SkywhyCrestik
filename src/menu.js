export function initMenu(onStartGame, playerModel) {
    const wins = ['win-settings', 'win-shop', 'win-notif'];
    
    const closeAll = () => wins.forEach(id => document.getElementById(id).style.display = 'none');
    
    document.getElementById('btn-settings').onclick = () => { closeAll(); document.getElementById('win-settings').style.display = 'block'; };
    document.getElementById('btn-shop').onclick = () => { closeAll(); document.getElementById('win-shop').style.display = 'block'; };
    document.getElementById('btn-notif').onclick = () => { closeAll(); document.getElementById('win-notif').style.display = 'block'; };
    
    document.querySelectorAll('.close-btn').forEach(btn => btn.onclick = closeAll);

    document.getElementById('set-gender').onchange = (e) => {
        if(playerModel) {
            playerModel.material.color.setHex(e.target.value === 'female' ? 0xff88aa : 0x4488ff);
        }
    };

    document.getElementById('start-btn').onclick = () => {
        closeAll();
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('game-ui').style.display = 'block';
        onStartGame();
    };
}
