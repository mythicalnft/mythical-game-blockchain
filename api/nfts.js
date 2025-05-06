const Blockfrost = require('@blockfrost/blockfrost-js');

module.exports = async (req, res) => {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }

        const blockfrost = new Blockfrost({
            projectId: process.env.BLOCKFROST_API_KEY || 'YOUR_BLOCKFROST_API_KEY',
            network: 'preprod'
        });

        const address = req.query.address;
        if (!address) {
            res.status(400).json({ error: 'Address is required' });
            return;
        }

        const assets = await blockfrost.addressesAssets(address);
        if (!assets || assets.length === 0) {
            res.status(200).json([]);
            return;
        }

        const nfts = assets.filter(asset => asset.asset.startsWith('0af26c4f3a8d3223c5fc22c666da02473c8c39d1b29a36723f3eb4b5'));
        if (!nfts || nfts.length === 0) {
            res.status(200).json([]);
            return;
        }

        const nftsWithMetadata = await Promise.all(nfts.map(async (nft) => {
            try {
                const metadata = await blockfrost.assetsById(nft.asset);
                const onchainMetadata = metadata.onchain_metadata || {};
                return {
                    asset: nft.asset,
                    asset_name: onchainMetadata.name || `NFT ${nft.asset.slice(0, 8)}`,
                    image: onchainMetadata.image ? onchainMetadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') : null
                };
            } catch (error) {
                console.error(`Error fetching metadata for asset ${nft.asset}:`, error);
                return {
                    asset: nft.asset,
                    asset_name: `NFT ${nft.asset.slice(0, 8)}`,
                    image: null
                };
            }
        }));

        res.status(200).json(nftsWithMetadata);
    } catch (error) {
        console.error('Error in /api/nfts:', error);
        res.status(500).json({ error: error.message || 'A server error occurred' });
    }
};
