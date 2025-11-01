import AdminSidebar from "@/components/admin/AdminSidebar";
// import { cookies } from "next/headers";
// import { redirect } from "next/navigation";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 🔐 Simple auth gate (replace with your real check)
  // e.g., a cookie set during login: "admin_session"
  //   const session = cookies().get("admin_session")?.value;
  //   if (!session) {
  //     redirect("/admin/login");
  //   }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        {/* optional top padding if you add a header here */}
        {children}
      </main>
    </div>
  );
}
