import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import axiosInstance from '../api/axiosInstance'; // Your configured axios instance

// Helper function to generate initials and a consistent background color
const generateInitialsAvatar = (name = '') => {
    const nameParts = name.trim().split(' ');
    const initials = (
        nameParts.length > 1
            ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
            : nameParts.length === 1 && nameParts[0].length > 0
                ? nameParts[0][0]
                : '?'
    ).toUpperCase();

    // Simple hash function to get a color index
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
        'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
        'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const color = colors[Math.abs(hash) % colors.length];

    return { initials, color };
};


const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [editProfileData, setEditProfileData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editProfilePicturePreview, setEditProfilePicturePreview] = useState(null); // For previewing Base64
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    // Fetch profile data
    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get('/users/profile');
            setProfileData(response.data);
            // Initialize edit state only if data is successfully fetched
            setEditProfileData({ ...response.data });
        } catch (err) {
            console.error("Error fetching profile:", err.response?.data || err.message);
            setError("Failed to load profile data. Please try again later.");
            if (err.response?.status === 401) {
                // Clear auth state and redirect to login if unauthorized
                localStorage.removeItem('quizAppToken');
                localStorage.removeItem('quizAppUser');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]); // Use fetchProfile in dependency array

    // Handle input changes for the edit form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle profile picture selection and preview
    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Basic validation (optional: add size limit)
            if (!file.type.startsWith('image/')) {
                 alert('Please select an image file.');
                 return;
            }
             if (file.size > 5 * 1024 * 1024) { // 5MB limit example
                 alert('Image size should be less than 5MB.');
                 return;
             }

            const reader = new FileReader();
            reader.onloadend = () => {
                // Set preview URL (Base64)
                setEditProfilePicturePreview(reader.result);
                // Update the profile picture data in the state to be saved
                setEditProfileData(prev => ({
                    ...prev,
                    profilePicture: reader.result // Store Base64 string
                }));
            };
            reader.onerror = () => {
                 console.error("Error reading file");
                 alert('Error reading image file.');
            }
            reader.readAsDataURL(file);
        }
    };

    // Toggle between view and edit mode
    const toggleEditMode = () => {
        setError(null); // Clear previous errors
        setIsEditing(!isEditing);
        if (!isEditing && profileData) {
            // Entering edit mode: Ensure edit state is synced with latest profile data
            setEditProfileData({ ...profileData });
            setEditProfilePicturePreview(profileData.profilePicture); // Set initial preview
        } else {
            // Exiting edit mode (Cancel): Revert edit state if needed, clear preview
             if(profileData) setEditProfileData({ ...profileData }); // Revert unsaved changes
             setEditProfilePicturePreview(null);
        }
    };

     // Handle canceling the edit
     const handleCancelEdit = () => {
        setError(null);
        setIsEditing(false);
        if (profileData) {
            setEditProfileData({ ...profileData }); // Revert changes in edit state
        }
        setEditProfilePicturePreview(null); // Clear preview
    };

    // Handle saving the updated profile
    const handleSaveProfile = async () => {
        if (!editProfileData) return;
        setIsSaving(true);
        setError(null);

        // Prepare data: only send changed fields (more efficient, but backend handles full update too)
        // Here we send all editable fields for simplicity, backend handles logic.
        // Ensure profilePicture is only sent if it has been changed (i.e., preview is different from original)
        const dataToUpdate = {
            name: editProfileData.name,
            username: editProfileData.username,
            email: editProfileData.email,
            bio: editProfileData.bio,
            // Conditionally add profilePicture only if it was actually changed
            ...(editProfileData.profilePicture !== profileData?.profilePicture && { profilePicture: editProfileData.profilePicture })
            // Password update would need separate input fields and logic
        };

        // Remove profilePicture key if it wasn't changed to avoid sending unchanged potentially large Base64 string
        if (dataToUpdate.profilePicture === undefined) {
            delete dataToUpdate.profilePicture;
        }

        try {
            const response = await axiosInstance.put('/users/profile', dataToUpdate);

            // Update main profile data state with the response from the server
            setProfileData(response.data);
            // Sync edit data state as well
            setEditProfileData({ ...response.data });
            setIsEditing(false); // Exit edit mode
            setEditProfilePicturePreview(null); // Clear preview

            // Update user info in local storage if name/username changed
            // Ensure the structure matches what your app expects elsewhere
            const currentUser = JSON.parse(localStorage.getItem('quizAppUser') || '{}');
            localStorage.setItem('quizAppUser', JSON.stringify({
                ...currentUser, // Keep existing fields like _id if needed
                username: response.data.username,
                name: response.data.name,
                 // Optionally update profile picture URL/data here if stored/used directly
            }));

            alert('Profile updated successfully!');

        } catch (err) {
            console.error('Error updating profile:', err.response?.data || err.message);
            let message = "Failed to update profile. Please check your input.";
            if (err.response?.data?.message) {
                // Use the specific error message from the backend
                message = err.response.data.message;
            } else if (err.response?.data?.errors) {
                 // Handle validation errors array
                 message = err.response.data.errors.join(' ');
            }
            setError(message); // Display error message to the user
             // Don't automatically redirect on update failure unless it's 401
             if (err.response?.status === 401) {
                 localStorage.removeItem('quizAppToken');
                 localStorage.removeItem('quizAppUser');
                 navigate('/login');
             }
        } finally {
            setIsSaving(false);
        }
    };

    // --- Render Logic ---

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen"><div className="text-xl text-purple-700">Loading profile...</div></div>;
    }

    // Show error prominently if loading failed completely
    if (error && !profileData) {
        return <div className="container mx-auto p-6 text-center"><div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"><strong className="font-bold">Error:</strong><span className="block sm:inline"> {error}</span></div></div>;
    }

    // Should not happen if loading is false and no critical error, but good practice
    if (!profileData || !editProfileData) {
        return <div className="text-center p-10">Could not load profile data. Please try refreshing.</div>;
    }

    // Generate initials avatar data only if needed
    const { initials, color } = (!profileData.profilePicture || profileData.profilePicture === 'https://via.placeholder.com/150')
        ? generateInitialsAvatar(profileData.name)
        : { initials: null, color: null };

    const displayPicture = isEditing && editProfilePicturePreview
        ? editProfilePicturePreview // Show preview in edit mode if available
        : profileData.profilePicture && profileData.profilePicture !== 'https://via.placeholder.com/150'
            ? profileData.profilePicture // Show actual picture if available and not placeholder
            : null; // Will trigger initial avatar rendering


    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200 w-full max-w-3xl transition-shadow duration-300 hover:shadow-lg">

                {/* Display Error Messages related to saving */}
                 {error && isEditing && (
                    <div className="p-4 bg-red-100 text-red-800 border-b border-red-200 text-center text-sm" role="alert">
                        {error}
                    </div>
                )}

                <div className="md:flex">
                    {/* === Left Panel: Avatar, Name, Username, Points === */}
                    <div className="md:w-1/3 p-6 md:p-8 text-center border-b md:border-b-0 md:border-r border-gray-200 bg-gradient-to-b from-blue-50 to-indigo-50 flex flex-col justify-center items-center space-y-4">
                        <div className="relative group">
                            {/* Avatar Display */}
                            {displayPicture ? (
                                <img
                                    src={displayPicture}
                                    alt="Profile"
                                    className="rounded-full w-32 h-32 md:w-36 md:h-36 mx-auto object-cover border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                // Initials Avatar Fallback
                                <div className={`rounded-full w-32 h-32 md:w-36 md:h-36 mx-auto flex items-center justify-center ${color} text-white text-4xl md:text-5xl font-bold border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-105`}>
                                    {initials}
                                </div>
                            )}

                            {/* Edit Icon Overlay */}
                            {isEditing && (
                                <label htmlFor="profilePictureInput" className="absolute bottom-1 right-1 cursor-pointer bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition duration-200">
                                    <i className="fas fa-camera text-purple-600 text-lg"></i>
                                    <input
                                        type="file"
                                        id="profilePictureInput"
                                        accept="image/png, image/jpeg, image/gif" // Be specific
                                        className="hidden"
                                        onChange={handleProfilePictureChange}
                                        disabled={isSaving}
                                    />
                                </label>
                            )}
                        </div>

                        {/* Name and Username */}
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mt-3">
                                {isEditing ? editProfileData.name : profileData.name}
                            </h3>
                            <p className="text-blue-600 mt-1 text-base">
                                @{isEditing ? editProfileData.username : profileData.username}
                            </p>
                        </div>

                         {/* Total Points Display */}
                         <div className="mt-4 pt-4 border-t border-gray-200 w-full flex flex-col items-center">
                              <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Total Points</p>
                              <p className="text-3xl font-semibold text-purple-700">
                                  <i className="fas fa-star mr-2 text-yellow-400"></i>
                                  {profileData.totalPoints}
                              </p>
                         </div>
                    </div>

                    {/* === Right Panel: Details / Edit Form === */}
                    <div className="md:w-2/3 p-6 md:p-8 bg-white">
                        {isEditing ? (
                            /* --- Edit Mode Form --- */
                            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
                                {/* Name Input */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input type="text" id="name" name="name" value={editProfileData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out disabled:bg-gray-100" disabled={isSaving}/>
                                </div>
                                 {/* Username Input */}
                                 <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <input type="text" id="username" name="username" value={editProfileData.username} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out disabled:bg-gray-100" disabled={isSaving}/>
                                </div>
                                {/* Email Input */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input type="email" id="email" name="email" value={editProfileData.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out disabled:bg-gray-100" disabled={isSaving}/>
                                </div>
                                {/* Bio Textarea */}
                                <div>
                                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                    <textarea id="bio" name="bio" value={editProfileData.bio || ''} onChange={handleInputChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 transition duration-150 ease-in-out disabled:bg-gray-100 resize-none" placeholder="Tell us a little about yourself..." disabled={isSaving}></textarea>
                                </div>
                                {/* Password Input (Optional - Add if needed) */}
                                {/*
                                <div>
                                    <label htmlFor="password">New Password (leave blank to keep current)</label>
                                    <input type="password" id="password" name="password" onChange={handleInputChange} className="..." disabled={isSaving}/>
                                </div>
                                */}
                                {/* Save/Cancel Buttons */}
                                <div className="flex justify-end items-center space-x-3 mt-8">
                                    <button
                                        onClick={handleCancelEdit}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-blue-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50"
                                        type="button"
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                     <button
                                        onClick={handleSaveProfile}
                                        className="inline-flex items-center px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isSaving || loading} // Also disable if still loading initial data
                                    >
                                        {isSaving ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin -ml-1 mr-2 h-4 w-4"></i> Saving...
                                            </>
                                        ) : (
                                             <>
                                                <i className="fas fa-save mr-2 h-4 w-4"></i> Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                             /* --- View Mode --- */
                            <div className="space-y-6">
                                {/* Display Full Name */}
                                <div className="flex items-center group">
                                    <i className="fas fa-user fa-fw w-6 text-center text-lg text-blue-500 mr-3 transition-colors duration-200 group-hover:text-blue-700"></i>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Full Name</p>
                                        <p className="text-gray-800 text-lg">{profileData.name}</p>
                                    </div>
                                </div>
                                {/* Display Username */}
                                <div className="flex items-center group">
                                    <i className="fas fa-at fa-fw w-6 text-center text-lg text-blue-500 mr-3 transition-colors duration-200 group-hover:text-blue-700"></i>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Username</p>
                                        <p className="text-gray-800 text-lg">@{profileData.username}</p>
                                    </div>
                                </div>
                                {/* Display Email */}
                                <div className="flex items-center group">
                                    <i className="fas fa-envelope fa-fw w-6 text-center text-lg text-blue-500 mr-3 transition-colors duration-200 group-hover:text-blue-700"></i>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                                        <p className="text-gray-800 text-lg">{profileData.email}</p>
                                    </div>
                                </div>
                                {/* Display Bio */}
                                <div className="flex items-start group"> {/* Use items-start for multiline bio */}
                                    <i className="fas fa-info-circle fa-fw w-6 text-center text-lg text-blue-500 mr-3 mt-1 transition-colors duration-200 group-hover:text-blue-700"></i>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Bio</p>
                                        <p className="text-gray-700 text-base mt-1 leading-relaxed">
                                            {profileData.bio || <span className="italic text-gray-500">No bio provided yet.</span>}
                                         </p>
                                    </div>
                                </div>

                                {/* Quiz Stats Section */}
                                

                                {/* Edit Button */}
                                <div className="mt-10 flex justify-end">
                                    <button
                                        onClick={toggleEditMode}
                                        className="inline-flex items-center px-5 py-2 border border-purple-600 rounded-md shadow-sm text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out hover:scale-105"
                                        type="button"
                                    >
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
