import React, { useEffect, useState } from 'react';
import { fetchUserProfile } from '../services/api';
import NFTGrid from '../components/NFTGrid';

const Profile = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [ownedNFTs, setOwnedNFTs] = useState([]);

    useEffect(() => {
        const getUserProfile = async () => {
            const profileData = await fetchUserProfile();
            setUserProfile(profileData);
            setOwnedNFTs(profileData.ownedNFTs);
        };

        getUserProfile();
    }, []);

    return (
        <div className="profile">
            {userProfile ? (
                <>
                    <h1>{userProfile.username}'s Profile</h1>
                    <p>Email: {userProfile.email}</p>
                    <h2>Owned NFTs</h2>
                    <NFTGrid nfts={ownedNFTs} />
                </>
            ) : (
                <p>Loading profile...</p>
            )}
        </div>
    );
};

export default Profile;