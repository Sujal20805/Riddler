import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Your backend URL

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

// Add a request interceptor to include the token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('quizAppToken'); // Or wherever you store the token
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;