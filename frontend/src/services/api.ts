import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

// Cria uma instância do axios com a URL base da nossa API
const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;