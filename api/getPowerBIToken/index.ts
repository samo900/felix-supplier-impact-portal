import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";

// For PowerBI embedding - install: npm install @azure/identity powerbi-api
// import { ClientSecretCredential } from "@azure/identity";
// import * as powerbi from "powerbi-api";

interface JWTPayload {
  email: string;
  accountId: string;
  role: string;
}

export async function getPowerBIToken(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Processing getPowerBIToken request');

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

    // Generate PowerBI embed token with RLS
    const embedToken = await generatePowerBIEmbedToken(payload.accountId, payload.email);

    return {
      status: 200,
      jsonBody: embedToken
    };

  } catch (error) {
    context.error('Error generating PowerBI token:', error);
    return {
      status: 500,
      jsonBody: { error: "Failed to generate PowerBI embed token" }
    };
  }
}

async function generatePowerBIEmbedToken(accountId: string, email: string) {
  // TODO: Implement actual PowerBI token generation
  // Uncomment and configure when ready:
  
  /*
  const credential = new ClientSecretCredential(
    process.env.POWERBI_TENANT_ID!,
    process.env.POWERBI_CLIENT_ID!,
    process.env.POWERBI_CLIENT_SECRET!
  );

  const tokenResponse = await credential.getToken("https://analysis.windows.net/powerbi/api/.default");
  
  const embedUrl = `https://app.powerbi.com/reportEmbed?reportId=${process.env.POWERBI_REPORT_ID}&groupId=${process.env.POWERBI_WORKSPACE_ID}`;
  
  // Generate embed token with RLS
  const requestBody = {
    datasets: [{
      id: process.env.POWERBI_DATASET_ID,
      // Row-level security: Filter by accountId
      xlmPermissions: [{
        username: email,
        roles: ["Supplier"],
        datasets: [process.env.POWERBI_DATASET_ID]
      }]
    }],
    reports: [{
      id: process.env.POWERBI_REPORT_ID
    }],
    identities: [{
      username: email,
      roles: ["Supplier"],
      datasets: [process.env.POWERBI_DATASET_ID],
      // This ensures only data for this accountId is visible
      customData: accountId
    }]
  };

  const response = await fetch(
    `https://api.powerbi.com/v1.0/myorg/GenerateToken`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenResponse.token}`
      },
      body: JSON.stringify(requestBody)
    }
  );

  const embedTokenData = await response.json();
  
  return {
    token: embedTokenData.token,
    tokenId: embedTokenData.tokenId,
    expiration: embedTokenData.expiration,
    embedUrl,
    reportId: process.env.POWERBI_REPORT_ID
  };
  */

  // Mock response for development
  return {
    token: "mock_embed_token",
    tokenId: "mock_token_id",
    expiration: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${process.env.POWERBI_REPORT_ID || 'mock-report-id'}`,
    reportId: process.env.POWERBI_REPORT_ID || 'mock-report-id',
    accountId // Include for client-side verification
  };
}

module.exports = getPowerBIToken;
