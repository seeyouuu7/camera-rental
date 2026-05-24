import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (session?.value !== "authenticated") {
    redirect("/admin/login");
  }
}

export async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("admin_session")?.value === "authenticated";
}
