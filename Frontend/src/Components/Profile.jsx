import React, { useState } from 'react';
import { Link } from "react-router-dom";

const Profile = () => {
    // State for profile data (replace with actual data fetching later)
    const [profileData, setProfileData] = useState({
        name: 'John Doe',
        username: 'johndoe123',
        email: 'john.doe@example.com',
        bio: 'Quiz enthusiast and learner. Always up for a challenge!',
        profilePicture: 'https://via.placeholder.com/150', // Placeholder image, replace with user's profile pic URL
        quizStats: {
            quizzesTaken: 45,
            averageScore: '88%',
            highestScore: '100%',
            categoriesCompleted: ['Science', 'History', 'Technology']
        }
    });

    // State for edit mode
    const [isEditing, setIsEditing] = useState(false);

    // State to hold temporary edited data before saving
    const [editProfileData, setEditProfileData] = useState({ ...profileData });

    // State to hold temporary profile picture URL during edit
    const [editProfilePicturePreview, setEditProfilePicturePreview] = useState(null);


    // Function to handle input changes in edit mode
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditProfileData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Function to handle profile picture file selection
    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditProfilePicturePreview(reader.result); // Set preview URL
                setEditProfileData(prevState => ({
                    ...prevState,
                    profilePicture: reader.result // Store base64 or URL, adjust as needed for backend
                }));
            };
            reader.readAsDataURL(file);
        }
    };


    // Function to toggle edit mode
    const toggleEditMode = () => {
        setIsEditing(!isEditing);
        if (!isEditing) {
            // When entering edit mode, initialize editProfileData with current profileData
            setEditProfileData({ ...profileData });
            setEditProfilePicturePreview(profileData.profilePicture); // Initialize preview with current pic
        } else {
            // When exiting edit mode (cancel), revert editProfileData to current profileData
            setEditProfileData({ ...profileData }); // or reset to original if needed.
            setEditProfilePicturePreview(null); // Clear preview on cancel
        }
    };

    // Function to handle save profile (currently just updates local state)
    const handleSaveProfile = () => {
        // ** Backend Integration (Commented Out for now) **
        // In a real application, you would send 'editProfileData' to your backend here
        // to update the profile in the database (MongoDB).
        // Example (using fetch API):
        // fetch('/api/profile/update', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(editProfileData)
        // })
        // .then(response => response.json())
        // .then(data => {
        //     if (data.success) {
        //         setProfileData({ ...editProfileData }); // Update local state with saved data
        //         setIsEditing(false); // Exit edit mode
        //         alert('Profile updated successfully!');
        //     } else {
        //         alert('Failed to update profile.');
        //     }
        // })
        // .catch(error => {
        //     console.error('Error updating profile:', error);
        //     alert('Error updating profile.');
        // });

        // For now, just update the local state and exit edit mode
        setProfileData({ ...editProfileData });
        setIsEditing(false);
        setEditProfilePicturePreview(null); // Clear preview after save
        alert('Profile updated (local state only - backend not integrated).');
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Revert editProfileData to the original profileData when canceling
        setEditProfileData({ ...profileData });
        setEditProfilePicturePreview(null); // Clear preview on cancel
    };


    return (
        <div className="container mx-auto p-4 md:p-8 lg:p-10 font-sans bg-gradient-to-br from-purple-200 to-blue-200 min-h-screen flex items-center justify-center"> {/* Enhanced background and centering */}
            <div className="bg-white shadow-xl rounded-3xl overflow-hidden border-2 border-purple-300 w-full max-w-2xl"> {/* Increased rounded corners and max width */}
                <div className="px-8 py-6 border-b border-purple-300 bg-gradient-to-r from-purple-100 to-blue-100"> {/* Lighter header background */}
                    <h2 className="text-3xl font-extrabold text-purple-800 tracking-tight"> {/* Larger and bolder title */}
                        <i className="fas fa-user-circle mr-3 text-purple-600"></i> {/* Icon color */}
                        Your Profile
                    </h2>
                </div>

                <div className="md:flex">
                    <div className="md:w-1/3 p-8 text-center border-r border-purple-300 bg-blue-50 md:bg-blue-100 flex flex-col justify-center items-center"> {/* Enhanced side background */}
                        <div className="mb-6 relative inline-block">
                            <img
                                src={isEditing && editProfilePicturePreview ? editProfilePicturePreview : profileData.profilePicture}
                                alt="Profile Picture"
                                className="rounded-full w-36 h-36 mx-auto object-cover border-4 border-white shadow-md" // Larger profile picture
                            />
                             {isEditing && (
                                <label htmlFor="profilePictureInput" className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 cursor-pointer shadow-md"> {/* Camera icon button styling */}
                                    <i className="fas fa-camera"></i>
                                    <input type="file" id="profilePictureInput" accept="image/*" className="hidden" onChange={handleProfilePictureChange} />
                                </label>
                            )}
                        </div>
                        <h3 className="text-2xl font-semibold text-purple-900">{profileData.name}</h3> {/* Larger name */}
                        <p className="text-blue-700 mt-2 text-lg">@{profileData.username}</p> {/* Larger username */}
                    </div>

                    <div className="md:w-2/3 p-8 bg-white">
                        {isEditing ? (
                            // Edit Mode Form
                            <div className="space-y-6"> {/* Spacing between form elements */}
                                <div>
                                    <label htmlFor="name" className="block text-purple-700 text-sm font-bold mb-2">Name</label>
                                    <input type="text" id="name" name="name" value={editProfileData.name} onChange={handleInputChange} className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md" /> {/* Improved input style */}
                                </div>
                                <div>
                                    <label htmlFor="username" className="block text-purple-700 text-sm font-bold mb-2">Username</label>
                                    <input type="text" id="username" name="username" value={editProfileData.username} onChange={handleInputChange} className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-purple-700 text-sm font-bold mb-2">Email</label>
                                    <input type="email" id="email" name="email" value={editProfileData.email} onChange={handleInputChange} className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md" />
                                </div>
                                <div>
                                    <label htmlFor="bio" className="block text-purple-700 text-sm font-bold mb-2">Bio</label>
                                    <textarea id="bio" name="bio" value={editProfileData.bio} onChange={handleInputChange} rows="3" className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"></textarea> {/* Improved textarea style */}
                                </div>
                                <div className="flex justify-end mt-8">
                                    <button onClick={handleSaveProfile} className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors duration-200 mr-2" type="button"> {/* Enhanced save button */}
                                        <i className="fas fa-save mr-2"></i> Save
                                    </button>
                                    <button onClick={handleCancelEdit} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors duration-200" type="button"> {/* Enhanced cancel button */}
                                        <i className="fas fa-times mr-2"></i> Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <div className="space-y-5"> {/* Spacing in view mode */}
                                <div>
                                    <p className="text-purple-700 font-semibold text-lg"><i className="fas fa-user mr-3 text-purple-500"></i> Name:</p> {/* Styled labels */}
                                    <p className="text-gray-800 text-lg">{profileData.name}</p> {/* Styled values */}
                                </div>
                                <div>
                                    <p className="text-purple-700 font-semibold text-lg"><i className="fas fa-at mr-3 text-purple-500"></i> Username:</p>
                                    <p className="text-gray-800 text-lg">@{profileData.username}</p>
                                </div>
                                <div>
                                    <p className="text-purple-700 font-semibold text-lg"><i className="fas fa-envelope mr-3 text-purple-500"></i> Email:</p>
                                    <p className="text-gray-800 text-lg">{profileData.email}</p>
                                </div>
                                <div>
                                    <p className="text-purple-700 font-semibold text-lg"><i className="fas fa-info-circle mr-3 text-purple-500"></i> Bio:</p>
                                    <p className="text-gray-800 text-lg">{profileData.bio || 'No bio available.'}</p>
                                </div>

                                <div className="mt-8 border-t pt-6 border-blue-200"> {/* Styled stats section */}
                                    <h4 className="text-2xl font-bold text-blue-800 mb-4"><i className="fas fa-chart-bar mr-3 text-blue-500"></i> Quiz Stats</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4"> {/* Responsive grid for stats */}
                                        <div>
                                            <p className="text-blue-700 font-semibold">Quizzes Taken:</p>
                                            <p className="text-gray-800">{profileData.quizStats.quizzesTaken}</p>
                                        </div>
                                        <div>
                                            <p className="text-blue-700 font-semibold">Avg. Score:</p>
                                            <p className="text-gray-800">{profileData.quizStats.averageScore}</p>
                                        </div>
                                        <div>
                                            <p className="text-blue-700 font-semibold">Highest Score:</p>
                                            <p className="text-gray-800">{profileData.quizStats.highestScore}</p>
                                        </div>
                                        <div className="col-span-full sm:col-span-2"> {/* Full width for categories on smaller screens */}
                                            <p className="text-blue-700 font-semibold">Categories Completed:</p>
                                            <ul className="list-disc list-inside text-gray-800">
                                                {profileData.quizStats.categoriesCompleted.map((category, index) => (
                                                    <li key={index}>{category}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 flex justify-end">
                                    <button onClick={toggleEditMode} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-5 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 transition-colors duration-200" type="button"> {/* Enhanced edit button */}
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