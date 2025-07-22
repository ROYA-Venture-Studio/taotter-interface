import React from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/ui/Breadcrumb/Breadcrumb";
import Icon from "../../components/ui/Icon/Icon";
import "./TablePage.css";
import { useGetAllAdminQuestionnairesQuery } from "../../store/api/questionnairesApi";
import { useState } from "react";

function StatusPill({ status }) {
  const color =
    status === "Open"
      ? "#e0f7fa"
      : status === "Closed"
      ? "#e0e7ff"
      : "#fffbe6";
  const textColor =
    status === "Open"
      ? "#1378d1"
      : status === "Closed"
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
        display: "inline-block"
      }}
    >
      {status}
    </span>
  );
}

function CustomerCell({ customer }) {
  return (
    <div className="table-customer-cell">
      <img src={customer.avatar} alt={customer.name} className="table-customer-avatar" />
      <div>
        <div className="table-customer-name">{customer.name}</div>
        <div className="table-customer-subtitle">{customer.subtitle}</div>
      </div>
    </div>
  );
}

export default function TablePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [taskTypeFilter, setTaskTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  // Fetch all questionnaires (requests) for admin
  const { data, isLoading, error, refetch } = useGetAllAdminQuestionnairesQuery({
    search: search || undefined,
    status: statusFilter || undefined,
    taskType: taskTypeFilter || undefined,
    page,
    limit: 20,
  });

  const requests = data?.data?.questionnaires || [];

  const handleRowClick = (id) => {
    navigate(`/admin/request/${id}`);
  };

  // Map API data to table fields
  const tableRows = requests.map((q) => {
    const customer = {
      name: q.startup?.name || q.basicInfo?.startupName || "Unknown",
      avatar: "/assets/icons/User.svg", // Optionally use founder avatar if available
      subtitle: q.startup?.company || "",
    };
    return {
      id: q.id,
      customer,
      product: q.basicInfo?.taskType || "",
      value: q.requirements?.budgetRange || "",
      closeDate: q.submittedAt ? new Date(q.submittedAt).toLocaleDateString() : "",
      status: q.status,
    };
  });

  return (
    <div className="admin-table-page">
      <div className="admin-table-header-row">
        <h1 className="admin-table-title">Requests</h1>
        <Breadcrumb
          items={[
            { label: "Home", href: "/admin/dashboard" },
            { label: "Table", href: "/admin/table", isActive: true }
          ]}
        />
      </div>
      <div className="admin-table-toolbar">
        <div className="admin-table-toolbar-left">
          <span className="admin-table-subtitle">Recent Request</span>
        </div>
        <div className="admin-table-toolbar-right">
          <input
            className="admin-table-search"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") refetch(); }}
          />
          <button className="admin-table-filter-btn" onClick={() => refetch()}>Filter</button>
        </div>
      </div>
      <div className="admin-table-container">
        <div className="admin-table-responsive">
          {isLoading ? (
            <div style={{ padding: 24 }}>Loading...</div>
          ) : error ? (
            <div style={{ color: "red", padding: 24 }}>Error loading requests.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Customer</th>
                  <th>Product/Service</th>
                  <th>Deal Value</th>
                  <th>Close Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((req) => (
                  <tr
                    key={req.id}
                    className="admin-table-row"
                    onClick={() => handleRowClick(req.id)}
                    tabIndex={0}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{req.id.slice(-8).toUpperCase()}</td>
                    <td><CustomerCell customer={req.customer} /></td>
                    <td>{req.product}</td>
                    <td>{req.value}</td>
                    <td>{req.closeDate}</td>
                    <td><StatusPill status={req.status} /></td>
                    <td>
                      <button
                        className="admin-table-action-btn"
                        title="Delete"
                        onClick={e => e.stopPropagation()}
                      >
                        <Icon name="trash" size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Pagination controls */}
      {data?.data?.pagination && (
        <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 8 }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            style={{ padding: "4px 12px" }}
          >
            Prev
          </button>
          <span>
            Page {data.data.pagination.currentPage} of {data.data.pagination.totalPages}
          </span>
          <button
            disabled={page >= data.data.pagination.totalPages}
            onClick={() => setPage(page + 1)}
            style={{ padding: "4px 12px" }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
