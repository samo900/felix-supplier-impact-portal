import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";

interface JWTPayload {
  email: string;
  accountId: string;
  role: string;
}

interface SupplierData {
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

export async function getSupplierData(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Processing getSupplierData request');

  try {
    // Verify JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        status: 401,
        jsonBody: { error: "Unauthorized - No token provided" }
      };
    }

    const token = authHeader.substring(7);
    const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
    
    let payload: JWTPayload;
    try {
      payload = jwt.verify(token, sessionSecret) as JWTPayload;
    } catch (err) {
      return {
        status: 401,
        jsonBody: { error: "Unauthorized - Invalid token" }
      };
    }

    // Row-level security: Only return data for this supplier's accountId
    const supplierData = await fetchSupplierData(payload.accountId);

    if (!supplierData) {
      return {
        status: 404,
        jsonBody: { error: "No data found for this supplier" }
      };
    }

    return {
      status: 200,
      jsonBody: supplierData
    };

  } catch (error) {
    context.log.error('Error fetching supplier data:', error);
    return {
      status: 500,
      jsonBody: { error: "Failed to fetch supplier data" }
    };
  }
}

async function fetchSupplierData(accountId: string): Promise<SupplierData | null> {
  // TODO: Replace with actual database query
  // Example with SQL:
  /*
  const result = await db.query(`
    SELECT 
      s.accountId,
      s.supplierName,
      COUNT(d.id) as totalDonations,
      SUM(d.mealsProvided) as mealsProvided,
      SUM(d.co2Saved) as co2Saved
    FROM suppliers s
    LEFT JOIN donations d ON s.accountId = d.accountId
    WHERE s.accountId = ?
    GROUP BY s.accountId
  `, [accountId]);
  
  const recentDonations = await db.query(`
    SELECT date, items, weight
    FROM donations
    WHERE accountId = ?
    ORDER BY date DESC
    LIMIT 10
  `, [accountId]);
  */

  // Mock data for development
  return {
    accountId,
    supplierName: "Sample Supplier",
    totalDonations: 156,
    mealsProvided: 2340,
    co2Saved: 890.5,
    recentDonations: [
      { date: "2026-01-01", items: 45, weight: 23.5 },
      { date: "2025-12-28", items: 38, weight: 19.2 },
      { date: "2025-12-25", items: 52, weight: 28.1 }
    ]
  };
}

app.http('getSupplierData', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: getSupplierData
});
