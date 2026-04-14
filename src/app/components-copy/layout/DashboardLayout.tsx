import Header from "./Header";
import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      <Sidebar />

      <div style={{ flex: 1 }}>
        <Header />

        <main style={{ padding: 20 }}>
          {children}
        </main>
      </div>

    </div>
  );
}