import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PowerBIEmbed from './PowerBIEmbed';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const { isAuthenticated, email, token, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
