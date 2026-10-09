import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

export async function verifyGoogleToken(
  idToken: string
) {
  const ticket =
    await googleClient.verifyIdToken({
      idToken,
      audience:
        process.env.GOOGLE_CLIENT_ID,
    });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error(
      "Invalid Google token."
    );
  }

  if (!payload.sub) {
    throw new Error(
      "Google account ID is missing."
    );
  }

  if (!payload.email) {
    throw new Error(
      "Google account email is missing."
    );
  }

  return {
    googleSub: payload.sub,
    email: payload.email
      .trim()
      .toLowerCase(),
    name: payload.name ?? null,
    picture: payload.picture ?? null,
    emailVerified:
      payload.email_verified === true,
  };
}