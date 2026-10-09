"use client";

import { GoogleLogin } from "@react-oauth/google";

type Props = {
  onSuccess?: () => void;
};

export default function GoogleSignInButton({
  onSuccess,
}: Props) {
  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        if (!credentialResponse.credential) {
          console.error(
            "Google credential missing."
          );
          return;
        }

        try {
          const response = await fetch(
            "/api/auth/google",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                idToken:
                  credentialResponse.credential,
              }),
            }
          );

          const data =
            await response.json();

          if (!response.ok) {
            console.error(
              "Google authentication failed:",
              data
            );
            return;
          }

          console.log(
            "Google authentication successful:",
            data
          );

          onSuccess?.();
        } catch (error) {
          console.error(
            "Google authentication error:",
            error
          );
        }
      }}
      onError={() => {
        console.error(
          "Google login failed."
        );
      }}
    />
  );
}