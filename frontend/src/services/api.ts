import axios from 'axios';
import './apiInterceptor';
import { setupInterceptors } from './apiInterceptor';

// Cria uma instância do axios com a URL base da nossa API
const api = axios.create({
  baseURL: 'http://10.0.2.2:3000',
});

setupInterceptors(api);

export default api;