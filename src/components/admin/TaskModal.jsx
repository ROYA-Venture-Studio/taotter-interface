import React, { useState, useEffect } from 'react';
import styles from './TaskModal.module.css';

// --- Icon Components ---
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.04321 1.04364C1.43373 0.653391 2.06682 0.65329 2.45728 1.04364L6.99927 5.58563L11.5413 1.04364L11.6165 0.975281C12.0092 0.654799 12.5891 0.677555 12.9553 1.04364C13.3215 1.40981 13.3442 1.98973 13.0237 2.38251L12.9553 2.4577L8.41333 6.99969L12.9553 11.5417L13.0237 11.6169C13.3442 12.0097 13.3215 12.5905 12.9553 12.9567C12.5892 13.3226 12.0091 13.3454 11.6165 13.0251L11.5413 12.9567L6.99829 8.41376L2.45728 12.9557C2.06675 13.3463 1.43374 13.3463 1.04321 12.9557C0.652782 12.5652 0.65272 11.9322 1.04321 11.5417L5.58423 6.99969L1.04321 2.4577C0.652781 2.06717 0.652719 1.43413 1.04321 1.04364Z" fill="#98A2B3" />
  </svg>
);

const PdfIcon = () => (
  <svg width="30" height="34" viewBox="0 0 30 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.875 0.75C5.75781 0.75 4.84375 1.66406 4.84375 2.78125V31.2188C4.84375 32.3359 5.75781 33.25 6.875 33.25H27.1875C28.3047 33.25 29.2188 32.3359 29.2188 31.2188V8.875L21.0938 0.75H6.875Z" fill="#E2E5E7" />
    <path d="M23.125 8.875H29.2188L21.0938 0.75V6.84375C21.0938 7.96094 22.0078 8.875 23.125 8.875Z" fill="#B0B7BD" />
    <path d="M25.1562 27.1562C25.1562 27.7148 24.6992 28.1719 24.1406 28.1719H1.79688C1.23828 28.1719 0.78125 27.7148 0.78125 27.1562V17C0.78125 16.4414 1.23828 15.9844 1.79688 15.9844H24.1406C24.6992 15.9844 25.1562 16.4414 25.1562 17V27.1562Z" fill="#F15642" />
    <path d="M5.20825 19.993C5.20825 19.7249 5.4195 19.4324 5.75974 19.4324H7.6356C8.69185 19.4324 9.64247 20.1392 9.64247 21.4941C9.64247 22.7778 8.69185 23.4928 7.6356 23.4928H6.27974V24.5653C6.27974 24.9228 6.05224 25.125 5.75974 25.125C5.49161 25.125 5.20825 24.9228 5.20825 24.5653V19.993ZM6.27974 20.4551V22.4782H7.6356C8.17997 22.4782 8.6106 21.9978 8.6106 21.4941C8.6106 20.9264 8.17997 20.4551 7.6356 20.4551H6.27974Z" fill="white" />
    <path d="M11.2331 25.1249C10.965 25.1249 10.6725 24.9787 10.6725 24.6222V20.0092C10.6725 19.7178 10.965 19.5055 11.2331 19.5055H13.0927C16.8038 19.5055 16.7226 25.1249 13.1658 25.1249H11.2331ZM11.745 20.4967V24.1347H13.0927C15.2855 24.1347 15.383 20.4967 13.0927 20.4967H11.745Z" fill="white" />
    <path d="M18.0388 20.5618V21.8526H20.1096C20.4021 21.8526 20.6946 22.1451 20.6946 22.4285C20.6946 22.6966 20.4021 22.916 20.1096 22.916H18.0388V24.6212C18.0388 24.9056 17.8367 25.124 17.5523 25.124C17.1948 25.124 16.9764 24.9056 16.9764 24.6212V20.0083C16.9764 19.7168 17.1958 19.5045 17.5523 19.5045H20.4032C20.7607 19.5045 20.9719 19.7168 20.9719 20.0083C20.9719 20.2683 20.7607 20.5608 20.4032 20.5608H18.0388V20.5618Z" fill="white" />
  </svg>
);

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


export default function TaskModal({ open, onClose, onSubmit, taskToEdit, boardId, columns = [], admins = [] }) {
  if (!open) return null;

  const isEditMode = Boolean(taskToEdit);

  const defaultState = {
    title: '',
    description: '',
    columnId: columns?.[0]?._id || '',
    taskType: TASK_TYPES[0].value,
    priority: PRIORITIES[1].value,
    assigneeId: '',
    dueDate: '',
    attachments: [],
  };

  // Prepopulate form fields in edit mode
  const [taskData, setTaskData] = useState(() => {
    if (isEditMode && taskToEdit) {
      return {
        ...defaultState,
        ...taskToEdit,
        dueDate: taskToEdit.dueDate
          ? new Date(taskToEdit.dueDate).toISOString().slice(0, 10)
          : "",
        assigneeId: typeof taskToEdit.assigneeId === "object"
          ? taskToEdit.assigneeId._id
          : taskToEdit.assigneeId || "",
        attachments: Array.isArray(taskToEdit.attachments) ? taskToEdit.attachments : [],
      };
    }
    return defaultState;
  });

  // Prepopulate selectedFiles with existing attachments in edit mode
  const [selectedFiles, setSelectedFiles] = useState(
    isEditMode && Array.isArray(taskToEdit?.attachments)
      ? []
      : []
  );

  useEffect(() => {
    if (!isEditMode && columns?.[0]?._id && !taskData.columnId) {
      setTaskData(prev => ({ ...prev, columnId: columns[0]._id }));
    }
  }, [columns, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUploadClick = () => {
    document.getElementById('task-file-input').click();
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', taskData.title);
    formData.append('description', taskData.description);
    formData.append('columnId', taskData.columnId);
    formData.append('taskType', taskData.taskType);
    formData.append('priority', taskData.priority);
    formData.append('assigneeId', taskData.assigneeId);
    formData.append('dueDate', taskData.dueDate);

    selectedFiles.forEach(file => {
      formData.append('attachments', file);
    });
    onSubmit(formData);
    onClose();
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <h2>{isEditMode ? 'Edit Task' : 'Create Next Task'}</h2>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            <CloseIcon />
          </button>
        </header>

        <form className={styles.form} onSubmit={handleFormSubmit} encType="multipart/form-data">
          <input
            type="file"
            id="task-file-input"
            style={{ display: 'none' }}
            multiple
            onChange={handleFileChange}
          />
          <div className={styles.formGroup}>
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={taskData.title}
              onChange={handleChange}
              placeholder="e.g., Implement new login page"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={taskData.description}
              onChange={handleChange}
              placeholder="Add a more detailed description..."
              rows="6"
            />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="columnId">Column</label>
              <select id="columnId" name="columnId" value={taskData.columnId} onChange={handleChange} required>
                <option value="">Select column</option>
                {columns.map(col => (
                  <option key={col._id} value={col._id}>
                    {col.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="taskType">Task Type</label>
              <select id="taskType" name="taskType" value={taskData.taskType} onChange={handleChange} required>
                {TASK_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="priority">Priority</label>
            <select id="priority" name="priority" value={taskData.priority} onChange={handleChange}>
              {PRIORITIES.map(p => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>


          <div className={styles.formGroup}>
            <label htmlFor="assigneeId">Assign To</label>
            <select id="assigneeId" name="assigneeId" value={taskData.assigneeId} onChange={handleChange}>
              <option value="">-- Unassigned --</option>
              {admins.map(admin => (
                <option key={admin._id} value={admin._id}>
                  {admin.profile?.firstName} {admin.profile?.lastName} ({admin.email})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={taskData.dueDate}
              onChange={handleChange}
            />
          </div>

          <div className={styles.attachmentsSection}>
            <div className={styles.attachmentsHeader}>
              <h3>Attachments</h3>
              <button type="button" className={styles.uploadButton} onClick={handleUploadClick}>Upload file</button>
            </div>
            <div className={styles.attachmentsList}>
              {/* Show existing attachments in edit mode */}
              {isEditMode && Array.isArray(taskData.attachments) && taskData.attachments.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 500, fontSize: 13, color: "#344054" }}>Existing Attachments:</div>
                  {taskData.attachments.map((file, idx) => (
                    <div key={file.id || file._id || idx} className={styles.attachmentItem}>
                      {file.mimeType === "application/pdf" ? <PdfIcon /> : <span>{file.originalName || file.filename}</span>}
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#2563eb", textDecoration: "underline", marginLeft: 8 }}
                      >
                        {file.originalName || file.filename}
                      </a>
                    </div>
                  ))}
                </div>
              )}
              {/* Show newly selected files */}
{selectedFiles.length > 0 ? (
  selectedFiles.map((file, idx) => (
    <div key={idx} className={styles.attachmentItem}>
      {file.type === "application/pdf" ? <PdfIcon /> : <span style={{ color: "#000" }}>{file.name}</span>}
      <span style={{ color: "#000" }}>{file.name}</span>
    </div>
  ))
) : (
                (!isEditMode || !taskData.attachments || taskData.attachments.length === 0) && (
                  <span>No attachments selected</span>
                )
              )}
            </div>
          </div>
          
          <footer className={styles.modalFooter}>
            <button type="submit" className={styles.submitButton}>
              {isEditMode ? 'Save Changes' : 'Create Task'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
