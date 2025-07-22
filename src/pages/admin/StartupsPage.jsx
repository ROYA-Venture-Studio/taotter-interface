import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/ui/Breadcrumb/Breadcrumb";
import "./TablePage.css";
import { useGetStartupsQuery } from "../../store/api/adminApi";

function StatusPill({ status }) {
  const color =
    status === "active"
      ? "#e8f5e8"
      : status === "inactive"
      ? "#f5f5f5"
      : status === "suspended"
      ? "#ffe6e6"
      : "#e0f7fa";
  const textColor =
    status === "active"
      ? "#1b7c1b"
      : status === "inactive"
      ? "#667085"
      : status === "suspended"
      ? "#d73030"
      : "#1378d1";
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
      {status}
    </span>
  );
}

function StartupCell({ startup }) {
  return (
    <div className="table-customer-cell">
      <img 
        src="/assets/icons/User.svg" 
        alt={startup.companyName} 
        className="table-customer-avatar" 
      />
      <div>
        <div className="table-customer-name">{startup.companyName}</div>
        <div className="table-customer-subtitle">{startup.founderName}</div>
      </div>
    </div>
  );
}

export default function StartupsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sprintCountFilter, setSprintCountFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useGetStartupsQuery({
    search: search || undefined,
    sprintCountFilter: sprintCountFilter || undefined,
    page,
    limit: 20,
  });

  const startups = data?.data?.startups || [];

  const handleRowClick = (startupId) => {
    navigate(`/admin/startups/${startupId}/sprints`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  return (
    <div className="admin-table-page">
      <div className="admin-table-header-row">
        <h1 className="admin-table-title">Startups</h1>
        <Breadcrumb
          items={[
            { label: "Home", href: "/admin/dashboard" },
            { label: "Startups", href: "/admin/startups", isActive: true }
          ]}
        />
      </div>
      
      <div className="admin-table-toolbar">
        <div className="admin-table-toolbar-left">
          <span className="admin-table-subtitle">All Registered Startups</span>
        </div>
        <div className="admin-table-toolbar-right">
          <input
            className="admin-table-search"
            placeholder="Search by company name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
          />
          <select
            className="admin-table-filter-select"
            value={sprintCountFilter}
            onChange={e => {
              setSprintCountFilter(e.target.value);
              setPage(1);
            }}
            style={{ marginLeft: 8, padding: "6px 12px", borderRadius: 4, border: "1px solid #d0d5dd" }}
          >
            <option value="">All Sprint Counts</option>
            <option value="0">0 Sprints</option>
            <option value="1-3">1-3 Sprints</option>
            <option value="4-10">4-10 Sprints</option>
            <option value="10+">10+ Sprints</option>
          </select>
          <button className="admin-table-filter-btn" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-responsive">
          {isLoading ? (
            <div style={{ padding: 24 }}>Loading startups...</div>
          ) : error ? (
            <div style={{ color: "red", padding: 24 }}>Error loading startups.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Startup Name</th>
                  <th>Number of Sprints</th>
                  <th>Date Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {startups.map((startup) => (
                  <tr
                    key={startup._id}
                    className="admin-table-row"
                    onClick={() => handleRowClick(startup._id)}
                    tabIndex={0}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <StartupCell startup={startup} />
                    </td>
                    <td>
                      <span style={{ 
                        fontWeight: 600, 
                        color: startup.sprintCount > 0 ? "#1378d1" : "#667085" 
                      }}>
                        {startup.sprintCount}
                      </span>
                    </td>
                    <td>{formatDate(startup.dateJoined)}</td>
                    <td>
                      <StatusPill status={startup.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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

      {startups.length === 0 && !isLoading && (
        <div style={{ 
          textAlign: "center", 
          padding: 48, 
          color: "#667085" 
        }}>
          No startups found matching your criteria.
        </div>
      )}
    </div>
  );
}
