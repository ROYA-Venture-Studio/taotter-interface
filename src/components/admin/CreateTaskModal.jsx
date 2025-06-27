import React, { useState } from "react";
import "./CreateTaskModal.css";

const TASK_TYPES = [
  { value: "development", label: "Development" },
  { value: "design", label: "Design" },
  { value: "research", label: "Research" },
  { value: "testing", label: "Testing" },
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "documentation", label: "Documentation" },
  { value: "meeting", label: "Meeting" },
  { value: "milestone", label: "Milestone" },
  { value: "review", label: "Review" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export default function CreateTaskModal({ open, onClose, onCreate, columns, admins = [], hideAssignment = false }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnId, setColumnId] = useState(columns?.[0]?._id || "");
  const [dueDate, setDueDate] = useState("");
  const [taskType, setTaskType] = useState(TASK_TYPES[0].value);
  const [priority, setPriority] = useState("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!columnId) {
      setError("Please select a column");
      return;
    }
    if (!taskType) {
      setError("Please select a task type");
      return;
    }
    setError("");
    onCreate({
      title,
      description,
      columnId,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      taskType,
      priority,
      assigneeId: assigneeId || undefined,
    });
  };

  return (
    <div className="create-task-modal-backdrop">
      <div className="create-task-modal">
        <div className="create-task-modal-header">
          <h2>Create New Task</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form className="create-task-form" onSubmit={handleSubmit}>
          <label>
            Title<span className="required">*</span>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label>
            Description
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </label>
          <label>
            Column<span className="required">*</span>
            <select
              value={columnId}
              onChange={e => setColumnId(e.target.value)}
              required
            >
              {columns.map(col => (
                <option key={col._id} value={col._id}>
                  {col.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Task Type<span className="required">*</span>
            <select
              value={taskType}
              onChange={e => setTaskType(e.target.value)}
              required
            >
              {TASK_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
            >
              {PRIORITIES.map(p => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          {!hideAssignment && (
            <label>
              Assign To
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
              >
                <option value="">-- Unassigned --</option>
                {admins.map(admin => (
                  <option key={admin._id} value={admin._id}>
                    {admin.profile?.firstName} {admin.profile?.lastName} ({admin.email})
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Due Date
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </label>
          {error && <div className="error">{error}</div>}
          <div className="create-task-modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="create-btn">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
