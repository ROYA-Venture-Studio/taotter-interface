import React, { useState } from "react";
import styles from './AdminTaskModal.module.css';

export default function AdminTaskModal({
  open,
  onClose,
  onSubmit,
  taskToEdit = null,
  columns = [],
  admins = [],
  hideAssignment = false
}) {
  const [formData, setFormData] = useState({
    title: taskToEdit?.title || '',
    description: taskToEdit?.description || '',
    columnId: taskToEdit?.columnId || (columns[0]?._id || ''),
    dueDate: taskToEdit?.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '',
    taskType: taskToEdit?.taskType || 'General',
    priority: taskToEdit?.priority || 'Medium',
    assigneeId: taskToEdit?.assigneeId?._id || taskToEdit?.assigneeId || '',
    status: taskToEdit?.status || '',
    comments: taskToEdit?.comments || '',
    links: taskToEdit?.links || '',
    attachments: []
  });

  if (!open) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: files
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <h2 className={styles.headerTitle}>
            {taskToEdit ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} className={styles.closeButton} aria-label="Close">
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>Task Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className={styles.textarea}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="columnId" className={styles.label}>Column</label>
              <select
                id="columnId"
                name="columnId"
                value={formData.columnId}
                onChange={handleInputChange}
                required
                className={styles.select}
              >
                {columns.map(col => (
                  <option key={col._id || col.key} value={col._id || col.key}>
                    {col.name || col.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="dueDate" className={styles.label}>Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="taskType" className={styles.label}>Task Type</label>
              <select
                id="taskType"
                name="taskType"
                value={formData.taskType}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="General">General</option>
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Research">Research</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="priority" className={styles.label}>Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {!hideAssignment && (
            <div className={styles.formGroup}>
              <label htmlFor="assigneeId" className={styles.label}>Assign To</label>
              <select
                id="assigneeId"
                name="assigneeId"
                value={formData.assigneeId}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="">Unassigned</option>
                {admins.map(admin => (
                  <option key={admin._id} value={admin._id}>
                    {admin.profile?.firstName} {admin.profile?.lastName} ({admin.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="attachments" className={styles.label}>Attachments</label>
            <input
              type="file"
              id="attachments"
              name="attachments"
              onChange={handleFileChange}
              multiple
              className={styles.input}
            />
          </div>

          <footer className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.buttonSecondary}>
              Cancel
            </button>
            <button type="submit" className={styles.buttonPrimary}>
              {taskToEdit ? 'Update Task' : 'Create Task'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}