import { createSupabaseServerClient } from "./supabaseServer";

const BACKEND_URL = "http://backend:4000";

export async function verifyAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log(
    "ADMIN VERIFY SESSION:",
    session ? "SESSION EXISTS" : "NO SESSION"
  );

  if (!session?.access_token) {
    console.log("ADMIN VERIFY: NO ACCESS TOKEN");
    return null;
  }

  console.log("ADMIN VERIFY: CALLING BACKEND");

  const response = await fetch(
    `${BACKEND_URL}/api/admin/auth/verify`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    }
  );

  console.log(
    "ADMIN VERIFY BACKEND STATUS:",
    response.status
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  console.log("ADMIN VERIFY RESULT:", data);

  if (!data?.authorized) {
    return null;
  }

  return data.user;
}