export interface AuthContextType {
  isAuthenticated: boolean;
  email: string | null;
  accountId: string | null;
  token: string | null;
  login: (email: string, token: string, accountId: string) => void;
  logout: () => void;
}

export interface SupplierData {
  accountId: string;
  supplierName: string;
  totalDonations: number;
  mealsProvided: number;
  co2Saved: number;
  recentDonations: Array<{
    date: string;
    items: number;
    weight: number;
  }>;
}

export interface PowerBIEmbedConfig {
  token: string;
  tokenId: string;
  expiration: string;
  embedUrl: string;
  reportId: string;
  accountId?: string;
}
