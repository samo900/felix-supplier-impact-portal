const crypto = require("crypto");
const otpStore = new Map();

module.exports = async function (context, req) {
    context.log('Processing sendOTP request');
    try {
        const body = req.body;
        const { email } = body;
        if (!email || !isValidEmail(email)) {
            context.res = {
                status: 400,
                body: { error: "Valid email is required" }
            };
            return;
        }
        // TODO: Verify email exists in supplier database and get accountId
        // For now, we'll use email as accountId
        const accountId = await getAccountIdForEmail(email);
        if (!accountId) {
            context.res = {
                status: 404,
                body: { error: "Supplier not found. Please contact support." }
            };
            return;
        }
        // Generate 6-digit OTP
        const otpCode = crypto.randomInt(100000, 999999).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
        // Store OTP
        otpStore.set(email.toLowerCase(), {
            code: otpCode,
            expiresAt,
            accountId
        });
        // Development mode - return OTP in response
        context.log(`DEV MODE: OTP for ${email}: ${otpCode}`);
        context.res = {
            status: 200,
            body: {
                success: true,
                message: "OTP sent successfully",
                dev_otp: otpCode
            }
        };
    }
    catch (error) {
        context.error('Error sending OTP:', error);
        context.res = {
            status: 500,
            body: { error: "Failed to send OTP" }
        };
    }
};
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
async function getAccountIdForEmail(email) {
    // TODO: Query your database to get the accountId for this supplier email
    // This is where you'd check if the email exists in your supplier table
    // and return the associated accountId
    // For now, return email as accountId (replace with actual DB query)
    // Example with SQL:
    // const result = await db.query('SELECT accountId FROM suppliers WHERE email = ?', [email]);
    // return result.rows[0]?.accountId || null;
    return email; // Placeholder
}
//# sourceMappingURL=index.js.map