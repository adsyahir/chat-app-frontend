import { cookies } from "next/headers";
import { redirect } from "next/navigation";
// import { clearAllUserStores } from "@/lib/chatStore";
export default async function LogoutPage() {
  const cookieStore = await cookies(); // ✅ await here
  const sessionCookie = cookieStore.get("connect.sid");

  if (sessionCookie?.value) {
    await fetch("http://localhost:8000/api/auth/logout", {
      method: "POST",
      headers: {
        Cookie: `connect.sid=${sessionCookie.value}`, // ✅ manually forward cookie
      },
    });
  }
  // clearAllUserStores();

  redirect("/login");
}
