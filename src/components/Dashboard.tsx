import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dataService } from '../services/api';
import { SupplierData } from '../types';
import PowerBIEmbed from './PowerBIEmbed';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const { isAuthenticated, email, token, logout } = useAuth();
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
          <div>
            <h1>Supplier Impact Dashboard</h1>
            <p className="user-email">{email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="powerbi-section">
          <div className="section-header">
            <h2>Your Impact Analytics</h2>
          </div>
          
          {token && (
            <PowerBIEmbed token={token} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
