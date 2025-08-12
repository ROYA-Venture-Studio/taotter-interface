import React from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/ui/Breadcrumb/Breadcrumb";
import Icon from "../../components/ui/Icon/Icon";
import "./TablePage.css";
import { useGetAllAdminQuestionnairesQuery } from "../../store/api/questionnairesApi";
import { useUpdateSelectedPackagePaymentStatusMutation } from "../../store/api/sprintsApi";
import { useState } from "react";

// Map backend status to user-friendly display
const getDisplayStatus = (status) => {
  switch (status) {
    case "submitted": return "Submitted";
    case "meeting_scheduled": return "Meeting Scheduled";
    case "sprint_created": return "Sprint Created";
    case "available": return "Available";
    case "package_selected": return "Package Selected";
    case "documents_submitted": return "Documents Submitted";
    case "in_progress": return "In Progress";
    case "on_hold": return "On Hold";
    case "completed": return "Completed";
    case "cancelled": return "Cancelled";
    default: return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  }
};

// Get status colors
const getStatusColor = (status) => {
  switch (status) {
    case "submitted": return { bg: "#dbeafe", text: "#1d4ed8" }; // blue
    case "meeting_scheduled": return { bg: "#fce7f3", text: "#be185d" }; // pink
    case "sprint_created": return { bg: "#e9d5ff", text: "#9333ea" }; // purple
    case "available": return { bg: "#cffafe", text: "#0891b2" }; // cyan
    case "package_selected": return { bg: "#ede9fe", text: "#7c3aed" }; // indigo
    case "documents_submitted": return { bg: "#d1fae5", text: "#047857" }; // teal
    case "in_progress": return { bg: "#dbeafe", text: "#2563eb" }; // blue
    case "on_hold": return { bg: "#fef3c7", text: "#b45309" }; // yellow
    case "completed": return { bg: "#dcfce7", text: "#16a34a" }; // green
    case "cancelled": return { bg: "#fee2e2", text: "#dc2626" }; // red
    default: return { bg: "#f3f4f6", text: "#6b7280" }; // gray
  }
};

function StatusPill({ status }) {
  const { bg, text } = getStatusColor(status);
  return (
    <span
      style={{
        background: bg,
        color: text,
        borderRadius: "999px",
        padding: "4px 14px",
        fontSize: "13px",
        fontWeight: 500,
        display: "inline-block"
      }}
    >
      {getDisplayStatus(status)}
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

export default function RequestsPage() {
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

  const [updateSelectedPackagePaymentStatus] = useUpdateSelectedPackagePaymentStatusMutation();
  const [updatingSprintId, setUpdatingSprintId] = useState(null);

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
      sprint: q.sprint || null
    };
  });

  return (
    <div className="admin-table-page">
      <div className="admin-table-header-row">
        <h1 className="admin-table-title">Requests</h1>
        <Breadcrumb
          items={[
            { label: "Home", href: "/admin/dashboard" },
            { label: "Requests", href: "/admin/requests", isActive: true }
          ]}
        />
      </div>
      <div className="admin-table-toolbar">
        <div className="admin-table-toolbar-left">
          <span className="admin-table-subtitle">Recent Requests</span>
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
                  <th>Submit Date</th>
                  <th>Status</th>
                  <th>Sprint Status</th>
                  <th>Payment Status</th>
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
                      {req.sprint ? (
                        <StatusPill status={req.sprint.status} />
                      ) : (
                        <span style={{ color: "#6b7280" }}>No Sprint</span>
                      )}
                    </td>
                    <td>
                      {req.sprint && req.sprint.selectedPackage ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <select
                            value={req.sprint.selectedPackagePaymentStatus}
                            style={{
                              padding: "2px 8px",
                              borderRadius: 4,
                              border: "1px solid #d1d5db",
                              background: "#fff",
                              color: req.sprint.selectedPackagePaymentStatus === "paid" ? "#16a34a" : "#ea580c",
                              fontWeight: 600,
                              fontSize: "0.95rem"
                            }}
                            onClick={e => e.stopPropagation()}
                            disabled={updatingSprintId === req.sprint.id}
                            onChange={async (e) => {
                              const newStatus = e.target.value;
                              if (newStatus !== req.sprint.selectedPackagePaymentStatus) {
                                setUpdatingSprintId(req.sprint.id);
                                try {
                                  await updateSelectedPackagePaymentStatus({
                                    sprintId: req.sprint.id,
                                    paymentStatus: newStatus
                                  });
                                  refetch();
                                } catch (err) {
                                  alert("Failed to update payment status");
                                }
                                setUpdatingSprintId(null);
                              }
                            }}
                          >
                            <option value="unpaid">Unpaid</option>
                            <option value="paid">Paid</option>
                          </select>
                          {updatingSprintId === req.sprint.id && (
                            <span style={{ marginLeft: 8 }}>
                              <svg width="18" height="18" viewBox="0 0 50 50">
                                <circle cx="25" cy="25" r="20" fill="none" stroke="#888" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round">
                                  <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="0.8s" from="0 25 25" to="360 25 25"/>
                                </circle>
                              </svg>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "#6b7280" }}>N/A</span>
                      )}
                    </td>
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
