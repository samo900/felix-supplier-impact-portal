import axios from 'axios';
import { SupplierData, PowerBIEmbedConfig } from '../types';

const API_BASE = process.env.REACT_APP_API_URL || 'https://felix-allocations-api.azurewebsites.net/api';

export const authService = {
  async sendOTP(email: string): Promise<{ success: boolean; dev_otp?: string }> {
    const response = await axios.post(`${API_BASE}/sendOTP`, { email });
    return response.data;
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
