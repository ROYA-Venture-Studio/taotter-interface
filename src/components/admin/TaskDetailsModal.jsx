import React, { useState } from "react";

export default function TaskDetailsModal({
  open,
  onClose,
  task,
  columns,
  onMoveTask,
  onEditTask,
  onDeleteTask,
  currentColumnId,
  admins = [],
}) {
  const [selectedColumn, setSelectedColumn] = useState(currentColumnId || (columns && columns[0]?._id));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!open) return null;

  const handleMove = () => {
    if (selectedColumn && onMoveTask) {
      onMoveTask(task.id, selectedColumn);
      onClose();
    }
  };

  const handleEdit = () => {
    if (onEditTask) onEditTask(task);
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    console.log("TaskDetailsModal handleDelete called", { onDeleteTask, id: task.id });
    if (typeof onDeleteTask === "function") {
      await onDeleteTask(task.id);
      onClose();
    } else {
      console.warn("onDeleteTask is not a function or not passed to TaskDetailsModal");
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.18)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        width: 564,
        height: 704,
        background: "#fff",
        borderRadius: 16,
        padding: 20,
        boxSizing: "border-box",
        position: "relative",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 700, fontSize: 22, color: "#344054" }}>Task Details</div>
          <button onClick={onClose} style={{
            background: "none",
            border: "none",
            fontSize: 24,
            cursor: "pointer",
            color: "#667085"
          }} aria-label="Close">&times;</button>
        </div>
        {/* Edit/Delete Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, gap: 8 }}>
          <button
            style={{
              width: 134,
              height: 44,
              padding: "12px 0",
              background: "#fff",
              border: "1px solid #D0D5DD",
              color: "#344054",
              fontWeight: 500,
              fontSize: 14,
              borderRadius: 8,
              cursor: "pointer"
            }}
            onClick={() => {
              console.log("Edit button clicked", { onEditTask });
              handleEdit();
            }}
          >Edit</button>
          <button
            style={{
              width: 134,
              height: 44,
              padding: "12px 0",
              background: "#F04438",
              border: "none",
              color: "#fff",
              fontWeight: 500,
              fontSize: 14,
              borderRadius: 8,
              cursor: "pointer"
            }}
            onClick={() => setShowDeleteConfirm(true)}
          >Delete</button>
        </div>
        {/* Task Name */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 500, fontSize: 14, color: "#344054" }}>Task Name</div>
          <div style={{ marginTop: 12, color: "#344054", fontSize: 16 }}>{task.title}</div>
        </div>
        {/* Description */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 500, fontSize: 14, color: "#344054" }}>Description</div>
          <div style={{ marginTop: 12, color: "#344054", fontSize: 15 }}>{task.description}</div>
        </div>
        {/* Date */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 500, fontSize: 14, color: "#344054" }}>Date</div>
          <div style={{ marginTop: 12, color: "#344054", fontSize: 15 }}>{task.date}</div>
        </div>
        {/* Assigned Admin */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 500, fontSize: 14, color: "#344054" }}>Assigned Admin</div>
          <div style={{ marginTop: 12, color: "#344054", fontSize: 15 }}>
            {task.assigneeId && typeof task.assigneeId === "object" && task.assigneeId.profile
              ? `${task.assigneeId.profile.firstName} ${task.assigneeId.profile.lastName}`
              : typeof task.assigneeId === "string"
                ? task.assigneeId
                : "Unassigned"}
          </div>
        </div>
        {/* Task Type */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 500, fontSize: 14, color: "#344054" }}>Task Type</div>
          <div style={{ marginTop: 12, color: "#344054", fontSize: 15 }}>{task.taskType}</div>
        </div>
        {/* Priority */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 500, fontSize: 14, color: "#344054" }}>Priority</div>
          <div style={{ marginTop: 12, color: "#344054", fontSize: 15 }}>{task.priority}</div>
        </div>
        {/* Attachments */}
        {Array.isArray(task.attachments) && task.attachments.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 500, fontSize: 14, color: "#344054" }}>Attachments</div>
            <ul style={{ marginTop: 12, paddingLeft: 18 }}>
              {task.attachments.map((file) => (
                <li key={file.id || file._id} style={{ marginBottom: 6 }}>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#2563eb", textDecoration: "underline" }}
                  >
                    {file.originalName || file.filename}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Current Column */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 500, fontSize: 14, color: "#344054" }}>Current Column</div>
          <div style={{ marginTop: 12 }}>
            <select
              value={selectedColumn}
              onChange={e => setSelectedColumn(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #D0D5DD",
                fontSize: 15,
                color: "#344054"
              }}
            >
              {columns.map(col => (
                <option key={col._id || col.key} value={col._id || col.key}>{col.label || col.name}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Footer Buttons */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "auto"
        }}>
          <button
            style={{
              width: 134,
              height: 44,
              padding: "12px 0",
              background: "#fff",
              border: "1px solid #D0D5DD",
              color: "#344054",
              fontWeight: 500,
              fontSize: 14,
              borderRadius: 8,
              cursor: "pointer"
            }}
            onClick={onClose}
          >Cancel</button>
          <button
            style={{
              width: 134,
              height: 44,
              padding: "12px 0",
              background: "#EB5E28",
              border: "none",
              color: "#fff",
              fontWeight: 500,
              fontSize: 14,
              borderRadius: 8,
              cursor: "pointer"
            }}
            onClick={handleMove}
          >Move Task</button>
        </div>
        {/* Delete Confirmation Popup */}
        {showDeleteConfirm && (
          <div style={{
            position: "fixed",
            left: 0, top: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.25)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <div style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              minWidth: 320,
              boxShadow: "0 2px 16px rgba(0,0,0,0.12)"
            }}>
              <div style={{ fontWeight: 600, fontSize: 18, color: "#F04438", marginBottom: 16 }}>
                Are you sure you want to delete this task?
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button
                  style={{
                    background: "#fff",
                    border: "1px solid #D0D5DD",
                    color: "#344054",
                    fontWeight: 500,
                    fontSize: 14,
                    borderRadius: 8,
                    padding: "8px 24px",
                    cursor: "pointer"
                  }}
                  onClick={() => setShowDeleteConfirm(false)}
                >Cancel</button>
                <button
                  style={{
                    background: "#F04438",
                    border: "none",
                    color: "#fff",
                    fontWeight: 500,
                    fontSize: 14,
                    borderRadius: 8,
                    padding: "8px 24px",
                    cursor: "pointer"
                  }}
                  onClick={handleDelete}
                >Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
