import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/api';
import { SupplierData } from '../types';
import PowerBIEmbed from './PowerBIEmbed';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const { isAuthenticated, email, accountId, token, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<SupplierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPowerBI, setShowPowerBI] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        if (!token) return;
        const supplierData = await dataService.getSupplierData(token);
        setData(supplierData);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, token, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading your impact data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">{error}</div>
        <button onClick={handleLogout} className="btn-secondary">Back to Login</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <img src="/felix-logo.png" alt="The Felix Project" className="dashboard-logo" />
          <div>
            <h1>Welcome, {data?.supplierName}</h1>
            <p className="user-email">{email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="impact-summary">
          <h2>Your Impact Summary</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-value">{data?.totalDonations.toLocaleString()}</div>
              <div className="stat-label">Total Donations</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🍽️</div>
              <div className="stat-value">{data?.mealsProvided.toLocaleString()}</div>
              <div className="stat-label">Meals Provided</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🌍</div>
              <div className="stat-value">{data?.co2Saved.toLocaleString()} kg</div>
              <div className="stat-label">CO₂ Saved</div>
            </div>
          </div>
        </div>

        <div className="recent-donations">
          <h2>Recent Donations</h2>
          <table className="donations-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Items</th>
                <th>Weight (kg)</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentDonations.map((donation, index) => (
                <tr key={index}>
                  <td>{new Date(donation.date).toLocaleDateString()}</td>
                  <td>{donation.items}</td>
                  <td>{donation.weight.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="powerbi-section">
          <div className="section-header">
            <h2>Detailed Analytics</h2>
            <button 
              onClick={() => setShowPowerBI(!showPowerBI)} 
              className="btn-primary"
            >
              {showPowerBI ? 'Hide' : 'View'} PowerBI Report
            </button>
          </div>
          
          {showPowerBI && token && (
            <PowerBIEmbed token={token} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
