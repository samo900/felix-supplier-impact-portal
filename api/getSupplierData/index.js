"use strict";

module.exports = async function (context, req) {
    context.log('Processing getSupplierData request');
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
            context.log.error('Token decode error:', err.message);
            context.res = {
                status: 401,
                body: { error: "Unauthorized - Invalid token", details: err.message }
            };
            return;
        }
        
        // Mock data for development
        const supplierData = {
            accountId: payload.accountId,
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
        
        context.res = {
            status: 200,
            body: supplierData
        };
    }
    catch (error) {
        context.log.error('Error fetching supplier data:', error);
        context.res = {
            status: 500,
            body: { error: "Failed to fetch supplier data" }
        };
    }
};