import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className="md:pl-64">
        <Header />

        <main>{children}</main>
      </div>
    </div>
  );
}