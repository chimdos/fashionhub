import axios from 'axios';
import './apiInterceptor';
import { setupInterceptors } from './apiInterceptor';

// Cria uma instância do axios com a URL base da nossa API
const api = axios.create({
  baseURL: 'https://fashionhub-backend-yuya.onrender.com',
});

setupInterceptors(api);

export default api;