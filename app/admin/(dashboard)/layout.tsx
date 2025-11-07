// app/admin/(dashboard)/layout.tsx
import AdminSidebar from "@/components/admin/AdminSidebar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminJWT, getAdminCookieName } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ⬇️ Next 16: cookies() returns a Promise<ReadonlyRequestCookies>
  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;

  if (!token) {
    redirect("/admin/login");
  }

  try {
    verifyAdminJWT(token); // throws if invalid/expired
  } catch {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
