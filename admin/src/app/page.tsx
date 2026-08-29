// Redirects the Admin root URL to the Admin login page.

import { redirect } from "next/navigation";

export default function AdminRootPage() {
  redirect("/login");
}