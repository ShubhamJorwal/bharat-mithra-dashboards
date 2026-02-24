export { default as axiosInstance } from './axiosInstance';
export { default as apiClient } from './apiClient';

// API Services - import and re-export
import servicesApi from './services.api';
import usersApi from './users.api';
import authApi from './auth.api';
import healthApi from './health.api';
import platformApi from './platform.api';

export { servicesApi, usersApi, authApi, healthApi, platformApi };
