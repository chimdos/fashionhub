import axios from 'axios';
import './apiInterceptor';
import { setupInterceptors } from './apiInterceptor';

const api = axios.create({
  baseURL: 'https://fashionhub-backend-yuya.onrender.com',
});

setupInterceptors(api);

export default api;