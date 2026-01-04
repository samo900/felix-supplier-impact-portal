"use strict";

module.exports = async function (context, req) {
    context.log('Processing getPowerBIToken request');
    try {
        // Verify token (simple base64 check for dev)
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            context.res = {
                status: 401,
                body: { error: "Unauthorized - No token provided" }
            };
            return;
        }
        const token = authHeader.substring(7);
        let payload;
        try {
            payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
            context.log('Token decoded successfully:', payload.email);
        }
        catch (err) {
            context.log.error('Token decode error:', err.message, 'Token:', token.substring(0, 20) + '...');
            context.res = {
                status: 401,
                body: { error: "Unauthorized - Invalid token", details: err.message }
            };
            return;
        }
        
        // Mock response for development
        context.res = {
            status: 200,
            body: {
                token: "mock_embed_token",
                tokenId: "mock_token_id",
                expiration: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                embedUrl: `https://app.powerbi.com/reportEmbed?reportId=${process.env.POWERBI_REPORT_ID || 'mock-report-id'}`,
                reportId: process.env.POWERBI_REPORT_ID || 'mock-report-id',
                accountId: payload.accountId
            }
        };
    }
    catch (error) {
        context.log.error('Error getting PowerBI token:', error);
        context.res = {
            status: 500,
            body: { error: "Failed to get PowerBI token" }
        };
    }
};
