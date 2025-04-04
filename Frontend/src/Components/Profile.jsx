import React, { useState, useEffect } from 'react'; // Add useEffect
import { Link, useNavigate } from "react-router-dom"; // Add useNavigate
import axiosInstance from '../api/axiosInstance'; // Import instance

const Profile = () => {
    // Initialize state with null or default structure
    const [profileData, setProfileData] = useState(null);
    const [editProfileData, setEditProfileData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editProfilePicturePreview, setEditProfilePicturePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    // Fetch profile data on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axiosInstance.get('/users/profile');
                setProfileData(response.data);
                setEditProfileData(response.data); // Initialize edit state as well
            } catch (err) {
                console.error("Error fetching profile:", err.response?.data || err.message);
                setError("Failed to load profile data.");
                if (err.response?.status === 401) {
                    localStorage.removeItem('quizAppToken');
                    localStorage.removeItem('quizAppUser');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]); // Add navigate dependency

    // ... (Keep handleInputChange, handleProfilePictureChange) ...
     const handleInputChange = (e) => { /* ... same ... */ };
     const handleProfilePictureChange = (e) => { /* ... same ... */ };


    const toggleEditMode = () => {
        setIsEditing(!isEditing);
        if (!isEditing && profileData) {
            // Entering edit mode: copy current profile data to edit state
            setEditProfileData({ ...profileData });
            setEditProfilePicturePreview(profileData.profilePicture);
        } else {
            // Exiting edit mode (Cancel): revert edit state if needed, clear preview
             if(profileData) setEditProfileData({ ...profileData });
             setEditProfilePicturePreview(null);
        }
    };

    const handleSaveProfile = async () => {
        if (!editProfileData) return;
        setIsSaving(true);
        setError(null);

        // Prepare data to send (only send fields that might change)
        const dataToUpdate = {
             name: editProfileData.name,
             username: editProfileData.username,
             email: editProfileData.email,
             bio: editProfileData.bio,
             // Send profilePicture ONLY if it was changed (check against original or preview existence)
             ...( (editProfilePicturePreview && editProfilePicturePreview !== profileData?.profilePicture) && { profilePicture: editProfileData.profilePicture } )
             // Password update would need separate handling/fields
        };


        try {
            const response = await axiosInstance.put('/users/profile', dataToUpdate);
            setProfileData(response.data); // Update main profile data with response
            setEditProfileData(response.data); // Sync edit data too
            setIsEditing(false); // Exit edit mode
            setEditProfilePicturePreview(null); // Clear preview
            alert('Profile updated successfully!');
             // Update local storage user info if name/username changed
             localStorage.setItem('quizAppUser', JSON.stringify({
                _id: response.data._id,
                username: response.data.username,
                name: response.data.name
            }));

        } catch (err) {
            console.error('Error updating profile:', err.response?.data || err.message);
             let message = "Failed to update profile.";
             if (err.response?.data?.message) {
                 message = err.response.data.message;
             }
             setError(message);
             alert(`Error: ${message}`); // Show error
             if (err.response?.status === 401) {
                 localStorage.removeItem('quizAppToken');
                 localStorage.removeItem('quizAppUser');
                 navigate('/login');
             }
        } finally {
             setIsSaving(false);
        }
    };

     const handleCancelEdit = () => {
        setIsEditing(false);
        if (profileData) {
            setEditProfileData({ ...profileData }); // Revert changes
        }
        setEditProfilePicturePreview(null);
        setError(null); // Clear any previous save errors
    };


     // --- Render Logic ---
    if (loading) {
        return <div className="text-center p-10">Loading profile...</div>;
    }

    if (error && !profileData) { // Show error only if loading failed completely
        return <div className="text-center p-10 text-red-600">Error: {error}</div>;
    }

     if (!profileData || !editProfileData) { // Should not happen if loading is false and no error, but good practice
        return <div className="text-center p-10">Could not load profile data.</div>;
    }


    // --- JSX Structure --- (Mostly the same, but use dynamic data and handle edit state)
    return (
        <div className="container mx-auto p-4 md:p-8 lg:p-10 font-sans bg-gradient-to-br from-purple-200 to-blue-200 min-h-screen flex items-center justify-center">
            <div className="bg-white shadow-xl rounded-3xl overflow-hidden border-2 border-purple-300 w-full max-w-2xl">
                {/* ... Header ... */}
                 {error && <div className="p-4 bg-red-100 text-red-700 text-center">{error}</div>} {/* Show update errors */}

                <div className="md:flex">
                    {/* Left Panel (Avatar, Name, Username) */}
                    <div className="md:w-1/3 p-8 text-center border-r border-purple-300 bg-blue-50 md:bg-blue-100 flex flex-col justify-center items-center">
                        <div className="mb-6 relative inline-block">
                            <img
                                src={isEditing && editProfilePicturePreview ? editProfilePicturePreview : profileData.profilePicture}
                                alt="Profile"
                                className="rounded-full w-36 h-36 mx-auto object-cover border-4 border-white shadow-md"
                            />
                             {isEditing && (
                                <label htmlFor="profilePictureInput" className="..."> {/* Camera icon */}
                                    <i className="fas fa-camera"></i>
                                    <input type="file" id="profilePictureInput" accept="image/*" className="hidden" onChange={handleProfilePictureChange} disabled={isSaving}/>
                                </label>
                            )}
                        </div>
                        {/* Use profileData for display, even during edit, unless editing that specific field */}
                        <h3 className="text-2xl font-semibold text-purple-900">{isEditing ? editProfileData.name : profileData.name}</h3>
                        <p className="text-blue-700 mt-2 text-lg">@{isEditing ? editProfileData.username : profileData.username}</p>
                    </div>

                    {/* Right Panel (Details / Edit Form) */}
                    <div className="md:w-2/3 p-8 bg-white">
                        {isEditing ? (
                            // Edit Mode Form
                            <div className="space-y-6">
                                {/* Name Input */}
                                <div>
                                    <label htmlFor="name" className="...">Name</label>
                                    <input type="text" id="name" name="name" value={editProfileData.name} onChange={handleInputChange} className="..." disabled={isSaving}/>
                                </div>
                                 {/* Username Input */}
                                 <div>
                                    <label htmlFor="username" className="...">Username</label>
                                    <input type="text" id="username" name="username" value={editProfileData.username} onChange={handleInputChange} className="..." disabled={isSaving}/>
                                </div>
                                {/* Email Input */}
                                <div>
                                    <label htmlFor="email" className="...">Email</label>
                                    <input type="email" id="email" name="email" value={editProfileData.email} onChange={handleInputChange} className="..." disabled={isSaving}/>
                                </div>
                                {/* Bio Textarea */}
                                <div>
                                    <label htmlFor="bio" className="...">Bio</label>
                                    <textarea id="bio" name="bio" value={editProfileData.bio} onChange={handleInputChange} rows="3" className="..." disabled={isSaving}></textarea>
                                </div>
                                {/* Save/Cancel Buttons */}
                                <div className="flex justify-end mt-8">
                                    <button onClick={handleSaveProfile} className="..." disabled={isSaving || loading}>
                                        {isSaving ? <><i className="fas fa-spinner fa-spin mr-2"></i> Saving...</> : <><i className="fas fa-save mr-2"></i> Save</>}
                                    </button>
                                    <button onClick={handleCancelEdit} className="..." type="button" disabled={isSaving}>
                                        <i className="fas fa-times mr-2"></i> Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                             // View Mode
                            <div className="space-y-5">
                                {/* Display Name */}
                                <div>
                                    <p className="..."><i className="fas fa-user mr-3 ..."></i> Name:</p>
                                    <p className="...">{profileData.name}</p>
                                </div>
                                 {/* Display Username */}
                                <div>
                                    <p className="..."><i className="fas fa-at mr-3 ..."></i> Username:</p>
                                    <p className="...">@{profileData.username}</p>
                                </div>
                                {/* Display Email */}
                                <div>
                                    <p className="..."><i className="fas fa-envelope mr-3 ..."></i> Email:</p>
                                    <p className="...">{profileData.email}</p>
                                </div>
                                 {/* Display Bio */}
                                <div>
                                    <p className="..."><i className="fas fa-info-circle mr-3 ..."></i> Bio:</p>
                                    <p className="...">{profileData.bio || 'No bio available.'}</p>
                                </div>

                                 {/* Quiz Stats Section (using placeholder data from backend for now) */}
                                <div className="mt-8 border-t pt-6 border-blue-200">
                                    <h4 className="..."><i className="fas fa-chart-bar mr-3 ..."></i> Quiz Stats</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                        <div><p className="...">Quizzes Taken:</p><p>{profileData.quizStats.quizzesTaken}</p></div>
                                        <div><p className="...">Avg. Score:</p><p>{profileData.quizStats.averageScore}</p></div>
                                        <div><p className="...">Highest Score:</p><p>{profileData.quizStats.highestScore}</p></div>
                                        <div className="col-span-full sm:col-span-2">
                                            <p className="...">Categories Completed:</p>
                                             {/* Render actual categories if backend provides them */}
                                            <p className="text-gray-500 italic"> (Stat tracking not fully implemented yet)</p>
                                        </div>
                                    </div>
                                </div>

                                 {/* Edit Button */}
                                <div className="mt-10 flex justify-end">
                                    <button onClick={toggleEditMode} className="..." type="button">
                                        <i className="fas fa-edit mr-2"></i> Edit Profile
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;