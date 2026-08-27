"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    async function testConnection() {
      const { error } = await supabase
        .from("categories")
        .select("id")
        .limit(1);

      setStatus(error ? `Error: ${error.message}` : "Supabase connected");
    }

    testConnection();
  }, []);

  return <main className="p-10 text-2xl">{status}</main>;
}