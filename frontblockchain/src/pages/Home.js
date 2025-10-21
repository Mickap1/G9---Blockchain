import React from 'react';
import NFTGrid from '../components/NFTGrid';
import { mockNFTs } from '../utils/mockData';
import './Home.css';

const Home = () => {
    return (
        <div className="home-page">
            <div className="hero-section">
                <h1>Discover, Collect, and Sell Extraordinary NFTs</h1>
                <p>The world's first and largest digital marketplace</p>
            </div>
            <NFTGrid nfts={mockNFTs} />
        </div>
    );
};

export default Home;