"use strict";

module.exports = async function (context, req) {
    context.log('Processing verifyOTP request');
    try {
        const { email, otp } = req.body || {};
        if (!email || !otp) {
            context.res = {
                status: 400,
                body: { error: "Email and otp are required" }
            };
            return;
        }
        const emailLower = email.toLowerCase();
        
        // In dev mode, accept any 6-digit OTP
        const isValidOTP = /^\d{6}$/.test(otp);
        
        if (!isValidOTP) {
            context.res = {
                status: 401,
                body: { error: "Invalid OTP format" }
            };
            return;
        }
        
        // For dev: return simple mock token (replace with JWT when dependencies work)
        const token = Buffer.from(JSON.stringify({
            email: emailLower,
            accountId: emailLower,
            role: 'supplier',
            exp: Date.now() + (8 * 60 * 60 * 1000)
        })).toString('base64');
        
        context.res = {
            status: 200,
            body: {
                success: true,
                token,
                accountId: emailLower,
                email: emailLower
            }
        };
    }
    catch (error) {
        context.log.error('Error verifying OTP:', error);
        context.res = {
            status: 500,
            body: { error: "Failed to verify OTP" }
        };
    }
};
//# sourceMappingURL=index.js.map