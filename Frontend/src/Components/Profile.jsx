import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import axiosInstance from '../api/axiosInstance';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';
import FormField from './ui/FormField';
import Avatar from './ui/Avatar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [editProfileData, setEditProfileData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editProfilePicturePreview, setEditProfilePicturePreview] = useState(null);
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
            setEditProfileData({ ...response.data });
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
    }, [navigate]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfilePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('PLEASE SELECT AN IMAGE FILE.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error('IMAGE SIZE SHOULD BE LESS THAN 5MB.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setEditProfilePicturePreview(reader.result);
                setEditProfileData(prev => ({
                    ...prev,
                    profilePicture: reader.result
                }));
            };
            reader.onerror = () => {
                console.error("Error reading file");
                toast.error('ERROR READING IMAGE FILE.');
            }
            reader.readAsDataURL(file);
        }
    };

    const toggleEditMode = () => {
        setError(null);
        setIsEditing(!isEditing);
        if (!isEditing && profileData) {
            setEditProfileData({ ...profileData });
            setEditProfilePicturePreview(profileData.profilePicture);
        } else {
            if (profileData) setEditProfileData({ ...profileData });
            setEditProfilePicturePreview(null);
        }
    };

    const handleCancelEdit = () => {
        setError(null);
        setIsEditing(false);
        if (profileData) {
            setEditProfileData({ ...profileData });
        }
        setEditProfilePicturePreview(null);
    };

    const handleSaveProfile = async () => {
        if (!editProfileData) return;
        setIsSaving(true);
        setError(null);

        const dataToUpdate = {
            name: editProfileData.name,
            username: editProfileData.username,
            email: editProfileData.email,
            bio: editProfileData.bio,
            ...(editProfileData.profilePicture !== profileData?.profilePicture && { profilePicture: editProfileData.profilePicture })
        };

        if (dataToUpdate.profilePicture === undefined) {
            delete dataToUpdate.profilePicture;
        }

        try {
            const response = await axiosInstance.put('/users/profile', dataToUpdate);

            setProfileData(response.data);
            setEditProfileData({ ...response.data });
            setIsEditing(false);
            setEditProfilePicturePreview(null);

            const currentUser = JSON.parse(localStorage.getItem('quizAppUser') || '{}');
            localStorage.setItem('quizAppUser', JSON.stringify({
                ...currentUser,
                username: response.data.username,
                name: response.data.name,
            }));

            toast.success('PROFILE DOSSIER UPDATED SUCCESS!');
        } catch (err) {
            console.error('Error updating profile:', err.response?.data || err.message);
            let message = "Failed to update profile.";
            if (err.response?.data?.message) {
                message = err.response.data.message;
            } else if (err.response?.data?.errors) {
                message = err.response.data.errors.join(' ');
            }
            setError(message);
            toast.error(message.toUpperCase());
            if (err.response?.status === 401) {
                localStorage.removeItem('quizAppToken');
                localStorage.removeItem('quizAppUser');
                navigate('/login');
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 scanlines game-dot-grid flex items-center justify-center p-4">
                <div className="font-heading font-black text-xl text-volt animate-pulse tracking-widest uppercase">
                    LOADING DOSSIER...
                </div>
            </div>
        );
    }

    if (error && !profileData) {
        return (
            <div className="min-h-screen bg-zinc-950 scanlines game-dot-grid flex items-center justify-center p-4">
                <div className="border-[3px] border-black bg-neon-pink text-white p-5 shadow-[4px_4px_0_0_#000] font-heading font-black uppercase text-sm">
                    CRITICAL ERROR: {error}
                </div>
            </div>
        );
    }

    const displayPicture = isEditing && editProfilePicturePreview
        ? editProfilePicturePreview
        : profileData.profilePicture && profileData.profilePicture !== 'https://via.placeholder.com/150'
            ? profileData.profilePicture
            : null;

    return (
        <div className="min-h-screen bg-zinc-950 text-white scanlines game-dot-grid py-12 px-4 flex items-center justify-center animate-scanline-laser">
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />

            <Card variant="default" className="w-full max-w-3xl animate-slide-up">
                {error && isEditing && (
                    <div className="mb-6 p-4 border-[3px] border-black bg-neon-pink text-white font-heading font-black uppercase text-xs shadow-[3px_3px_0_0_#000]" role="alert">
                        <i className="fa-solid fa-triangle-exclamation mr-2"></i> ERROR: {error}
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Column: Avatar & Quick Info */}
                    <div className="md:w-1/3 flex flex-col items-center bg-zinc-950 border-[3px] border-black p-6 relative">
                        <div className="absolute top-2 left-2">
                            <Badge variant="cyan">USER ID</Badge>
                        </div>

                        <div className="relative mt-4">
                            {displayPicture ? (
                                <img
                                    src={displayPicture}
                                    alt="Profile"
                                    className="w-32 h-32 md:w-36 md:h-36 object-cover border-[3px] border-black shadow-[4px_4px_0_0_#000]"
                                />
                            ) : (
                                <Avatar title={profileData.name} size="xl" />
                            )}

                            {isEditing && (
                                <label htmlFor="profilePictureInput" className="absolute bottom-[-10px] right-[-10px] cursor-pointer w-10 h-10 flex items-center justify-center border-2 border-black bg-volt text-black shadow-[2px_2px_0_0_#000] hover:bg-volt-dark transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                                    <i className="fa-solid fa-camera text-sm"></i>
                                    <input
                                        type="file"
                                        id="profilePictureInput"
                                        accept="image/png, image/jpeg, image/gif"
                                        className="hidden"
                                        onChange={handleProfilePictureChange}
                                        disabled={isSaving}
                                    />
                                </label>
                            )}
                        </div>

                        <div className="text-center mt-6 w-full">
                            <h3 className="text-2xl font-black uppercase font-heading tracking-wide text-white leading-tight">
                                {isEditing ? editProfileData.name : profileData.name}
                            </h3>
                            <p className="text-volt font-heading font-black uppercase text-xs tracking-wider mt-1">
                                @{isEditing ? editProfileData.username : profileData.username}
                            </p>
                        </div>

                        <div className="mt-6 pt-5 border-t-2 border-zinc-800 w-full flex flex-col items-center">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono mb-1">TOTAL POINTS</span>
                            <span className="font-heading font-black text-3xl text-volt flex items-center gap-1.5 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">
                                <i className="fa-solid fa-star text-sm text-neon-cyan"></i>
                                {profileData.totalPoints}
                            </span>
                        </div>
                    </div>

                    {/* Right Column: Form or Info details */}
                    <div className="md:w-2/3 flex-grow flex flex-col justify-between">
                        {isEditing ? (
                            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
                                <FormField
                                    label="Full Name"
                                    id="name"
                                    name="name"
                                    value={editProfileData.name}
                                    onChange={handleInputChange}
                                    disabled={isSaving}
                                    icon="fa-solid fa-signature"
                                />

                                <FormField
                                    label="Username"
                                    id="username"
                                    name="username"
                                    value={editProfileData.username}
                                    onChange={handleInputChange}
                                    disabled={isSaving}
                                    icon="fa-solid fa-user-ninja"
                                />

                                <FormField
                                    label="Email Address"
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={editProfileData.email}
                                    onChange={handleInputChange}
                                    disabled={isSaving}
                                    icon="fa-solid fa-envelope"
                                />

                                <div className="flex flex-col gap-1.5 w-full">
                                    <label htmlFor="bio" className="text-sm font-extrabold uppercase tracking-wider text-zinc-300 font-heading">
                                        Bio Info
                                    </label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        value={editProfileData.bio || ''}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-4 py-3 bg-zinc-900 border-[3px] border-black text-white placeholder-zinc-500 rounded-none focus:outline-none focus:border-volt focus:ring-4 focus:ring-volt/20 transition-all duration-150 font-medium resize-none"
                                        placeholder="Add background status info..."
                                        disabled={isSaving}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 mt-4">
                                    <Button
                                        onClick={handleCancelEdit}
                                        variant="ghost"
                                        disabled={isSaving}
                                    >
                                        CANCEL
                                    </Button>
                                    <Button
                                        onClick={handleSaveProfile}
                                        variant="volt"
                                        loading={isSaving}
                                    >
                                        SAVE DOSSIER
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex flex-col h-full justify-between gap-6">
                                <div className="space-y-6">
                                    <div className="flex items-start border-b-[3px] border-black/20 pb-4">
                                        <div className="w-10 h-10 flex items-center justify-center border-2 border-black bg-volt text-black text-lg mr-4 rotate-[-3deg]">
                                            <i className="fa-solid fa-user"></i>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">FULL NAME</span>
                                            <span className="text-white font-heading font-black uppercase text-lg tracking-wide">{profileData.name}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start border-b-[3px] border-black/20 pb-4">
                                        <div className="w-10 h-10 flex items-center justify-center border-2 border-black bg-neon-cyan text-black text-lg mr-4 rotate-[3deg]">
                                            <i className="fa-solid fa-at"></i>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">USERNAME HANDLE</span>
                                            <span className="text-white font-heading font-black text-lg tracking-wide">@{profileData.username}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start border-b-[3px] border-black/20 pb-4">
                                        <div className="w-10 h-10 flex items-center justify-center border-2 border-black bg-neon-pink text-white text-lg mr-4 rotate-[-3deg]">
                                            <i className="fa-solid fa-envelope"></i>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">EMAIL COMPORT</span>
                                            <span className="text-white font-body font-bold text-base md:text-lg">{profileData.email}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start pb-2">
                                        <div className="w-10 h-10 flex items-center justify-center border-2 border-black bg-zinc-800 text-zinc-400 text-lg mr-4 rotate-[3deg]">
                                            <i className="fa-solid fa-circle-info"></i>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">BIO COMPORT</span>
                                            <p className="text-zinc-300 font-body mt-1 leading-relaxed text-sm md:text-base">
                                                {profileData.bio || <span className="italic text-zinc-500">No profile status description provided.</span>}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6 border-t-2 border-black">
                                    <Button
                                        onClick={toggleEditMode}
                                        variant="pink"
                                    >
                                        <i className="fa-solid fa-user-pen mr-2"></i> EDIT DOSSIER
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Profile;
