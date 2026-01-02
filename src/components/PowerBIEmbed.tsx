import { useEffect, useState } from 'react';
import { models } from 'powerbi-client';
import { PowerBIEmbed as PowerBIEmbedComponent } from 'powerbi-client-react';
import { dataService } from '../services/api';
import { PowerBIEmbedConfig } from '../types';
import '../styles/PowerBIEmbed.css';

interface PowerBIEmbedProps {
  token: string;
}

const PowerBIEmbed: React.FC<PowerBIEmbedProps> = ({ token }) => {
  const [embedConfig, setEmbedConfig] = useState<PowerBIEmbedConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmbedToken = async () => {
      try {
        const config = await dataService.getPowerBIToken(token);
        setEmbedConfig(config);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load PowerBI report');
      } finally {
        setLoading(false);
      }
    };

    fetchEmbedToken();
  }, [token]);

  if (loading) {
    return <div className="powerbi-loading">Loading report...</div>;
  }

  if (error) {
    return <div className="powerbi-error">{error}</div>;
  }

  if (!embedConfig) {
    return null;
  }

  const reportConfig: models.IReportEmbedConfiguration = {
    type: 'report',
    id: embedConfig.reportId,
    embedUrl: embedConfig.embedUrl,
    accessToken: embedConfig.token,
    tokenType: models.TokenType.Embed,
    settings: {
      panes: {
        filters: {
          expanded: false,
          visible: true
        }
      },
      background: models.BackgroundType.Transparent,
    }
  };

  return (
    <div className="powerbi-container">
      <PowerBIEmbedComponent
        embedConfig={reportConfig}
        cssClassName="powerbi-report"
      />
      <p className="powerbi-note">
        This report is filtered to show only your organization's data. 
        Refresh will expire in {new Date(embedConfig.expiration).toLocaleTimeString()}.
      </p>
    </div>
  );
};

export default PowerBIEmbed;
