// Creates and stores a guest cart session ID in the browser.

const CART_SESSION_KEY = "guest_cart_session_id";

export function getGuestSessionId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  let sessionId = localStorage.getItem(CART_SESSION_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(CART_SESSION_KEY, sessionId);
  }

  return sessionId;
}