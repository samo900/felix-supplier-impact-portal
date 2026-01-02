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
exports.getSupplierData = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const crypto = __importStar(require("crypto"));
async function getSupplierData(request, context) {
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
    }
    catch (error) {
        context.error('Error fetching supplier data:', error);
        return {
            status: 500,
            jsonBody: { error: "Failed to fetch supplier data" }
        };
    }
}
exports.getSupplierData = getSupplierData;
async function fetchSupplierData(accountId) {
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
module.exports = getSupplierData;
//# sourceMappingURL=index.js.map