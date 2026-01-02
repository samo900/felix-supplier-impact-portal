import axios from 'axios';
import { SupplierData, PowerBIEmbedConfig } from '../types';

const API_BASE = '/api';

export const authService = {
  async sendOTP(email: string): Promise<void> {
    await axios.post(`${API_BASE}/sendOTP`, { email });
  },

  async verifyOTP(email: string, code: string): Promise<{ token: string; accountId: string; email: string }> {
    const response = await axios.post(`${API_BASE}/verifyOTP`, { email, code });
    return response.data;
  }
};

export const dataService = {
  async getSupplierData(token: string): Promise<SupplierData> {
    const response = await axios.get(`${API_BASE}/getSupplierData`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  async getPowerBIToken(token: string): Promise<PowerBIEmbedConfig> {
    const response = await axios.get(`${API_BASE}/getPowerBIToken`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  }
};
