// Variable global para la wallet conectada
let connectedWallet = null;

// Función para conectar la wallet
async function connectWallet() {
  try {
    if (window.cardano) {
      const wallet = window.cardano; // Esto puede ser Eternl o Lace
      await wallet.enable();
      connectedWallet = wallet;
      console.log('Conectado a la wallet:', wallet);
      
      // Llamamos a la función para obtener NFTs desde la wallet
      await loadNFTsFromWallet();
    } else {
      alert('No se detectó una wallet compatible.');
    }
  } catch (error) {
    console.error('Error al conectar la wallet:', error);
  }
}

// Cargar NFTs desde la wallet
async function loadNFTsFromWallet() {
  try {
    const utxos = await connectedWallet.getUtxos();
    
    // Filtramos los UTXOs que contienen NFTs
    const nftUtxos = utxos.filter(utxo => {
      return utxo.assets && utxo.assets.length > 0;
    });

    for (let utxo of nftUtxos) {
      for (let asset of utxo.assets) {
        const assetName = asset.assetName;
        const policyId = asset.policyId;
        
        // Llamar a Blockfrost para obtener metadatos
        const metadata = await fetchNFTMetadata(policyId, assetName);
        
        if (metadata) {
          console.log('NFT Metadata:', metadata);
          
          // Cargar la imagen del NFT desde IPFS
          const ipfsUrl = ipfsToHttp(metadata.image);
          loadNFTSprite(ipfsUrl);
        }
      }
    }
  } catch (error) {
    console.error('Error al cargar los NFTs:', error);
  }
}

// Obtener los metadatos del NFT usando Blockfrost
async function fetchNFTMetadata(policyId, assetName) {
  const blockfrostApiKey = 'YOUR_BLOCKFROST_API_KEY'; // Reemplazar con tu clave de Blockfrost
  const url = `https://cardano-mainnet.blockfrost.io/api/v0/assets/${policyId}/${assetName}`;
  
  const response = await fetch(url, {
    headers: {
      'project_id': blockfrostApiKey
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener los metadatos del NFT');
  }

  const metadata = await response.json();
  return metadata;
}

// Convertir URL IPFS a HTTP
function ipfsToHttp(ipfsUrl) {
  if (ipfsUrl.startsWith("ipfs://")) {
    return ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return ipfsUrl;
}

// Cargar la imagen del NFT en Phaser
function loadNFTSprite(ipfsUrl) {
  const gameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
      preload: preload,
      create: create
    }
  };

  const game = new Phaser.Game(gameConfig);

  function preload() {
    this.load.image('nftSprite', ipfsUrl);
  }

  function create() {
    const sprite = this.add.sprite(400, 300, 'nftSprite');
    sprite.setScale(0.5);
  }
}

// Asignar evento de clic al botón de conexión
document.getElementById('connectButton').addEventListener('click', connectWallet);


