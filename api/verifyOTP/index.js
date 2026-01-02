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
exports.verifyOTP = void 0;
const functions_1 = require("@azure/functions");
const jwt = __importStar(require("jsonwebtoken"));
const crypto = __importStar(require("crypto"));
// Share this with sendOTP (use external storage in production)
const otpStore = new Map();
async function verifyOTP(request, context) {
    context.log('Processing verifyOTP request');
    try {
        const body = await request.json();
        const { email, code } = body;
        if (!email || !code) {
            return {
                status: 400,
                jsonBody: { error: "Email and code are required" }
            };
        }
        const emailLower = email.toLowerCase();
        const storedOTP = otpStore.get(emailLower);
        if (!storedOTP) {
            return {
                status: 401,
                jsonBody: { error: "Invalid or expired OTP" }
            };
        }
        // Check expiration
        if (Date.now() > storedOTP.expiresAt) {
            otpStore.delete(emailLower);
            return {
                status: 401,
                jsonBody: { error: "OTP has expired" }
            };
        }
        // Verify code
        if (storedOTP.code !== code) {
            return {
                status: 401,
                jsonBody: { error: "Invalid OTP code" }
            };
        }
        // OTP is valid - delete it and create session token
        otpStore.delete(emailLower);
        const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
        const token = jwt.sign({
            email: emailLower,
            accountId: storedOTP.accountId,
            role: 'supplier'
        }, sessionSecret, { expiresIn: '8h' });
        return {
            status: 200,
            jsonBody: {
                success: true,
                token,
                accountId: storedOTP.accountId,
                email: emailLower
            }
        };
    }
    catch (error) {
        context.error('Error verifying OTP:', error);
        return {
            status: 500,
            jsonBody: { error: "Failed to verify OTP" }
        };
    }
}
exports.verifyOTP = verifyOTP;
functions_1.app.http('verifyOTP', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: verifyOTP
});
//# sourceMappingURL=index.js.map