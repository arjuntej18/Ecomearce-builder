"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyGoogleToken = verifyGoogleToken;
const google_auth_library_1 = require("google-auth-library");
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
async function verifyGoogleToken(idToken) {
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
        throw new Error("Invalid Google token.");
    }
    if (!payload.sub) {
        throw new Error("Google account ID is missing.");
    }
    if (!payload.email) {
        throw new Error("Google account email is missing.");
    }
    return {
        googleSub: payload.sub,
        email: payload.email
            .trim()
            .toLowerCase(),
        name: payload.name ?? null,
        picture: payload.picture ?? null,
        emailVerified: payload.email_verified === true,
    };
}
