// app/(frontend)/layout.tsx
import NavBar from "@/components/NavBar"; // can be a Client Component

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout is nested under app/layout.tsx.
  // It wraps ONLY the routes inside (frontend).
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
