import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "../../components/ui/Breadcrumb/Breadcrumb";
import "./TablePage.css";
import { useGetStartupSprintsQuery } from "../../store/api/adminApi";

function StatusPill({ status }) {
  const color =
    status === "completed"
      ? "#e8f5e8"
      : status === "in_progress"
      ? "#e0f7fa"
      : status === "on_hold"
      ? "#ffe6e6"
      : status === "cancelled"
      ? "#f5f5f5"
      : "#fffbe6";
  const textColor =
    status === "completed"
      ? "#1b7c1b"
      : status === "in_progress"
      ? "#1378d1"
      : status === "on_hold"
      ? "#d73030"
      : status === "cancelled"
      ? "#667085"
      : "#b26a00";
  return (
    <span
      style={{
        background: color,
        color: textColor,
        borderRadius: "999px",
        padding: "4px 14px",
        fontSize: "13px",
        fontWeight: 500,
        display: "inline-block",
        textTransform: "capitalize"
      }}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

function ProgressBar({ progress }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ 
        width: 60, 
        height: 6, 
        background: "#f0f0f0", 
        borderRadius: 3,
        overflow: "hidden"
      }}>
        <div style={{ 
          width: `${progress}%`, 
          height: "100%", 
          background: progress === 100 ? "#1b7c1b" : "#1378d1",
          transition: "width 0.3s"
        }} />
      </div>
      <span style={{ fontSize: 12, color: "#667085", minWidth: 30 }}>
        {progress}%
      </span>
    </div>
  );
}

export default function StartupSprintsPage() {
  const navigate = useNavigate();
  const { startupId } = useParams();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useGetStartupSprintsQuery({
    startupId,
    page,
    limit: 20,
  });

  const startup = data?.data?.startup;
  const sprints = data?.data?.sprints || [];

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const handleBackToStartups = () => {
    navigate("/admin/startups");
  };

  const handleSprintClick = (sprint) => {
    if (sprint.boardId) {
      navigate(`/admin/board/${sprint.boardId}`);
    }
  };

  return (
    <div className="admin-table-page">
      <div className="admin-table-header-row">
        <h1 className="admin-table-title">
          Sprints for {startup?.companyName || 'Startup'}
        </h1>
        <Breadcrumb
          items={[
            { label: "Home", href: "/admin/dashboard" },
            { label: "Startups", href: "/admin/startups" },
            { label: startup?.companyName || 'Startup', isActive: true }
          ]}
        />
      </div>
      
      <div className="admin-table-toolbar">
        <div className="admin-table-toolbar-left">
          <span className="admin-table-subtitle">
            {sprints.length} Sprint{sprints.length !== 1 ? 's' : ''} Total
          </span>
        </div>
        <div className="admin-table-toolbar-right">
          <button 
            className="admin-table-filter-btn" 
            onClick={handleBackToStartups}
            style={{ background: "#667085" }}
          >
            ← Back to Startups
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        {isLoading ? (
          <div style={{ padding: 24 }}>Loading sprints...</div>
        ) : error ? (
          <div style={{ color: "red", padding: 24 }}>Error loading sprints.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Sprint Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Package</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {sprints.map((sprint) => (
                <tr
                  key={sprint._id}
                  className="admin-table-row"
                  onClick={() => handleSprintClick(sprint)}
                  style={{ cursor: sprint.boardId ? "pointer" : "default" }}
                >
                  <td style={{ fontWeight: 600, color: "#101828" }}>
                    {sprint.name}
                  </td>
                  <td>
                    <span style={{ 
                      textTransform: "capitalize",
                      background: "#f2f4f7",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 12,
                      color: "#344054"
                    }}>
                      {sprint.type}
                    </span>
                  </td>
                  <td>
                    <StatusPill status={sprint.status} />
                  </td>
                  <td>
                    <ProgressBar progress={sprint.progress} />
                  </td>
                  <td>
                    {sprint.hasSelectedPackage ? (
                      <span style={{ color: "#1378d1", fontSize: 12 }}>
                        ✓ Selected
                      </span>
                    ) : (
                      <span style={{ color: "#667085", fontSize: 12 }}>
                        Not selected
                      </span>
                    )}
                  </td>
                  <td>{formatDate(sprint.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data?.data?.pagination && (
        <div style={{ 
          marginTop: 16, 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          gap: 8 
        }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            style={{ 
              padding: "8px 16px", 
              border: "1px solid #d0d5dd", 
              borderRadius: 4,
              background: page <= 1 ? "#f9fafb" : "white",
              color: "#111",
              cursor: page <= 1 ? "not-allowed" : "pointer"
            }}
          >
            Previous
          </button>
          <span style={{ padding: "0 16px", fontWeight: 500 }}>
            Page {data.data.pagination.currentPage} of {data.data.pagination.totalPages}
          </span>
          <button
            disabled={page >= data.data.pagination.totalPages}
            onClick={() => setPage(page + 1)}
            style={{ 
              padding: "8px 16px", 
              border: "1px solid #d0d5dd", 
              borderRadius: 4,
              background: page >= data.data.pagination.totalPages ? "#f9fafb" : "white",
              color: "#111",
              cursor: page >= data.data.pagination.totalPages ? "not-allowed" : "pointer"
            }}
          >
            Next
          </button>
        </div>
      )}

      {sprints.length === 0 && !isLoading && (
        <div style={{ 
          textAlign: "center", 
          padding: 48, 
          color: "#667085" 
        }}>
          No sprints found for this startup.
        </div>
      )}
    </div>
  );
}
