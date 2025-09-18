import React from "react";
import StartupHeader from "../components/layout/Header/StartupHeader";
import Footer from "../components/layout/Footer/Footer";

const DashboardLayout = ({ children }) => (
  <div className="dashboard-layout">
    <StartupHeader />
    <main className="dashboard-main-content">{children}</main>
    {/* <Footer /> */}
  </div>
);

export default DashboardLayout;
