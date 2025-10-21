import React from 'react';
import './NFTCard.css';

export const mockNFTs = [
    {
        id: 1,
        name: "Cosmic Explorer #001",
        image: "https://picsum.photos/400/400?random=1",
        price: "2.5 ETH",
        creator: "0x742d...35a4",
        description: "A rare cosmic explorer from the depths of space",
        category: "Art"
    },
    {
        id: 2,
        name: "Digital Dream #042",
        image: "https://picsum.photos/400/400?random=2",
        price: "1.8 ETH",
        creator: "0x8f3c...92b1",
        description: "Abstract digital art representing dreams",
        category: "Art"
    },
    {
        id: 3,
        name: "Cyber Punk Avatar #123",
        image: "https://picsum.photos/400/400?random=3",
        price: "3.2 ETH",
        creator: "0x1a2b...c3d4",
        description: "Futuristic cyberpunk character",
        category: "Avatar"
    },
    {
        id: 4,
        name: "Ocean Waves #007",
        image: "https://picsum.photos/400/400?random=4",
        price: "1.5 ETH",
        creator: "0x5e6f...7g8h",
        description: "Mesmerizing ocean waves in motion",
        category: "Photography"
    },
    {
        id: 5,
        name: "Golden Dragon #888",
        image: "https://picsum.photos/400/400?random=5",
        price: "5.0 ETH",
        creator: "0x9i0j...1k2l",
        description: "Legendary golden dragon NFT",
        category: "Gaming"
    },
    {
        id: 6,
        name: "Neon City #456",
        image: "https://picsum.photos/400/400?random=6",
        price: "2.0 ETH",
        creator: "0x3m4n...5o6p",
        description: "Vibrant neon cityscape",
        category: "Art"
    },
    {
        id: 7,
        name: "Abstract Minds #101",
        image: "https://picsum.photos/400/400?random=7",
        price: "1.2 ETH",
        creator: "0x7q8r...9s0t",
        description: "Abstract representation of consciousness",
        category: "Art"
    },
    {
        id: 8,
        name: "Space Cat #333",
        image: "https://picsum.photos/400/400?random=8",
        price: "0.8 ETH",
        creator: "0x1u2v...3w4x",
        description: "Adorable space-traveling feline",
        category: "Collectible"
    }
];

export const mockUserProfile = {
    address: "0x742d35a4f8b9c1e6d2a5f3b7c8e9d1a2b3c4d5e6",
    username: "CryptoArtist",
    avatar: "https://picsum.photos/200/200?random=99",
    bio: "Digital artist and NFT collector",
    ownedNFTs: [1, 3, 5],
    createdNFTs: [2, 4, 6, 7]
};


const NFTCard = ({ nft }) => {
    return (
        <div className="nft-card">
            <div className="nft-image-container">
                <img src={nft.image} alt={nft.name} className="nft-image" />
                <span className="nft-category">{nft.category}</span>
            </div>
            <div className="nft-details">
                <h3 className="nft-name">{nft.name}</h3>
                <p className="nft-description">{nft.description}</p>
                <div className="nft-footer">
                    <div className="nft-creator">
                        <span className="creator-label">Creator:</span>
                        <span className="creator-address">{nft.creator}</span>
                    </div>
                    <div className="nft-price-container">
                        <span className="nft-price">{nft.price}</span>
                        <button className="buy-button">Buy Now</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NFTCard;