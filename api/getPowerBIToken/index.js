"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPowerBIToken = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const crypto = __importStar(require("crypto"));
async function getPowerBIToken(request, context) {
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
        let payload;
        try {
            payload = jwt.verify(token, sessionSecret);
        }
        catch (err) {
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
    }
    catch (error) {
        context.error('Error generating PowerBI token:', error);
        return {
            status: 500,
            jsonBody: { error: "Failed to generate PowerBI embed token" }
        };
    }
}
exports.getPowerBIToken = getPowerBIToken;
async function generatePowerBIEmbedToken(accountId, email) {
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
exports.default = getPowerBIToken;
//# sourceMappingURL=index.js.map