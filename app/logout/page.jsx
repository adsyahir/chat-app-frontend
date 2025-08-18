import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clearAllUserStores } from "@/lib/stores";
export default async function LogoutPage() {
  const cookieStore = await cookies(); // ✅ await here
  const sessionCookie = cookieStore.get("connect.sid");

  if (sessionCookie?.value) {
    await fetch(`${process.env.BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        Cookie: `connect.sid=${sessionCookie.value}`, // ✅ manually forward cookie
      },
    });
  }
  clearAllUserStores();

  redirect("/login");
}
