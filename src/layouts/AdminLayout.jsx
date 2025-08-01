import React, { useState, useCallback } from "react";
import AdminHeader from "../components/layout/AdminHeader/AdminHeader";
import AdminSidebar from "../components/layout/AdminSidebar/AdminSidebar";

export default function AdminLayout({ children }) {
  // Sidebar is open by default on desktop, closed by default on mobile
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  // Responsive sidebar toggle
  const handleMenuClick = useCallback(() => {
    setSidebarOpen((open) => !open);
  }, []);

  // Listen for window resize to auto-open sidebar on desktop
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Responsive margin for content area based on sidebar state
  const getContentMargin = () => (sidebarOpen ? 290 : 0);

  // Update margin on sidebar toggle or window resize
  const [contentMargin, setContentMargin] = useState(getContentMargin());
  React.useEffect(() => {
    const handleResize = () => setContentMargin(getContentMargin());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  React.useEffect(() => {
    setContentMargin(getContentMargin());
    // eslint-disable-next-line
  }, [sidebarOpen]);

  return (
    <div className="admin-layout">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className="admin-layout-content"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: contentMargin,
          transition: "margin-left 0.2s",
          minHeight: "100vh"
        }}
      >
        <AdminHeader onMenuClick={handleMenuClick} />
        <main style={{ flex: 1, background: "#f8fafc", padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
