import axios from 'axios';

const API_BASE_URL = 'https://api.example.com'; // Replace with your actual API base URL

export const fetchNFTs = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/nfts`);
        return response.data;
    } catch (error) {
        console.error('Error fetching NFTs:', error);
        throw error;
    }
};

export const fetchUserProfile = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};