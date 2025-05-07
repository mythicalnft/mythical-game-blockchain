const POLICY_ID = '0af26c4f3a8d3223c5fc22c666da02473c8c39d1b29a36723f3eb4b5';
let userAddress = null;
let nftImageUrl = null;

document.getElementById('connectWallet').addEventListener('click', async () => {
    try {
        const wallet = await connectWallet();
        if (!wallet) {
            alert("Instala Nami o Lace wallet.");
            return;
        }

        const api = await wallet.enable();
        const usedAddresses = await api.getUsedAddresses();
        userAddress = usedAddresses[0];
        console.log("Conectado a:", userAddress);

        nftImageUrl = await obtenerImagenNFT(userAddress, POLICY_ID);
        startGame();

    } catch (err) {
        console.error("Error al conectar con la wallet:", err);
    }
});

async function connectWallet() {
    if (window.cardano) {
        if (window.cardano.nami) {
            return window.cardano.nami;
        } else if (window.cardano.lace) {
            return window.cardano.lace;
        }
    }
    return null;
}

async function obtenerImagenNFT(address, policyId) {
    try {
        const response = await fetch(`https://server.jpgstoreapis.com/user/${address}/assets`);
        const data = await response.json();

        const nfts = data?.assets?.filter(asset => asset.policy_id === policyId);

        if (nfts && nfts.length > 0) {
            const imageUrl = nfts[0].optimized_image || nfts[0].image;
            console.log("NFT encontrado:", imageUrl);
            return imageUrl;
        } else {
            console.log("No se encontró un NFT de la colección.");
            return 'assets/player.png'; // fallback
        }
    } catch (e) {
        console.error("Error al obtener NFT:", e);
        return 'assets/player.png'; // fallback
    }
}

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
        this.load.image('player', nftImageUrl || 'assets/player.png');
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
        this.input.on('pointerdown', () => {
            if (player.body.touching.down) {
                player.setVelocityY(-350);
            }
        });
    }

    function update() {
        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-350);
        }
    }
}

