let userAddress = null;

document.getElementById('connectWallet').addEventListener('click', async () => {
    if (window.cardano && window.cardano.nami) {
        try {
            await window.cardano.nami.enable();
            const api = window.cardano.nami;
            const usedAddresses = await api.getUsedAddresses();
            userAddress = usedAddresses[0];
            console.log("Conectado a:", userAddress);
            startGame();
        } catch (err) {
            console.error("Error al conectar con la wallet:", err);
        }
    } else {
        alert("Instala Nami Wallet para continuar.");
    }
});

function startGame() {
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 400,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 300 },
                debug: false
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        },
        parent: 'game-container'
    };

    const game = new Phaser.Game(config);
    let player;
    let cursors;

    function preload() {
        this.load.image('ground', 'assets/ground.png');
        this.load.image('player', 'assets/player.png');
    }

    function create() {
        this.add.text(10, 10, "Jugador: " + (userAddress || "Desconocido"), { fontSize: '16px', fill: '#000' });

        const ground = this.physics.add.staticGroup();
        ground.create(400, 390, 'ground').setScale(2).refreshBody();

        player = this.physics.add.sprite(100, 300, 'player').setScale(1);
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);

        this.physics.add.collider(player, ground);
        cursors = this.input.keyboard.createCursorKeys();
    }

    function update() {
        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-350);
        }
    }
}
