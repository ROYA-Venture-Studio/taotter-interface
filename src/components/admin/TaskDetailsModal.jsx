import React, { useState } from 'react';
import styles from './TaskDetailsModal.module.css';

// --- Icon Components ---
const CloseIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.04321 1.04364C1.43373 0.653391 2.06682 0.65329 2.45728 1.04364L6.99927 5.58563L11.5413 1.04364L11.6165 0.975281C12.0092 0.654799 12.5891 0.677555 12.9553 1.04364C13.3215 1.40981 13.3442 1.98973 13.0237 2.38251L12.9553 2.4577L8.41333 6.99969L12.9553 11.5417L13.0237 11.6169C13.3442 12.0097 13.3215 12.5905 12.9553 12.9567C12.5892 13.3226 12.0091 13.3454 11.6165 13.0251L11.5413 12.9567L6.99829 8.41376L2.45728 12.9557C2.06675 13.3463 1.43374 13.3463 1.04321 12.9557C0.652782 12.5652 0.65272 11.9322 1.04321 11.5417L5.58423 6.99969L1.04321 2.4577C0.652781 2.06717 0.652719 1.43413 1.04321 1.04364Z" fill="#98A2B3" />
    </svg>
);

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

    if (!open || !task) return null;

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
        if (typeof onDeleteTask === "function") {
            await onDeleteTask(task.id);
            onClose();
        } else {
            console.warn("onDeleteTask is not a function or not passed to TaskDetailsModal");
        }
    };

    return (
        <div className={styles.modalBackdrop} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <header className={styles.modalHeader}>
                    <h2 className={styles.headerTitle}>Task Details</h2>
                    <button onClick={onClose} className={styles.closeButton} aria-label="Close">
                        <CloseIcon />
                    </button>
                </header>

                {/* Edit/Delete Buttons */}
                <div className={styles.actionsHeader}>
                    <button className={styles.buttonSecondary} onClick={handleEdit}>Edit</button>
                    <button className={styles.buttonDelete} onClick={() => setShowDeleteConfirm(true)}>Delete</button>
                </div>

                <div className={styles.detailsContainer}>
                    {/* Task Name */}
                    <div className={styles.detailItem}>
                        <div className={styles.detailLabel}>Task Name</div>
                        <div className={styles.detailValue}>{task.title}</div>
                    </div>

                    {/* Description */}
                    <div className={styles.detailItem}>
                        <div className={styles.detailLabel}>Description</div>
                        <div className={styles.detailValue}>{task.description || 'No description provided.'}</div>
                    </div>

                    {/* Date */}
                    <div className={styles.detailItem}>
                        <div className={styles.detailLabel}>Due Date</div>
                        <div className={styles.detailValue}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date.'}</div>
                    </div>

                    {/* Assigned Admin */}
                    <div className={styles.detailItem}>
                        <div className={styles.detailLabel}>Assigned To</div>
                        <div className={styles.detailValue}>
                            {task.assigneeId && typeof task.assigneeId === "object" && task.assigneeId.profile
                                ? `${task.assigneeId.profile.firstName} ${task.assigneeId.profile.lastName}`
                                : "Unassigned"}
                        </div>
                    </div>

                    {/* Task Type */}
                    <div className={styles.detailItem}>
                        <div className={styles.detailLabel}>Task Type</div>
                        <div className={styles.detailValue}>{task.taskType}</div>
                    </div>

                    {/* Priority */}
                    <div className={styles.detailItem}>
                        <div className={styles.detailLabel}>Priority</div>
                        <div className={styles.detailValue}>{task.priority}</div>
                    </div>

                    {/* Attachments */}
                    {Array.isArray(task.attachments) && task.attachments.length > 0 && (
                        <div className={styles.detailItem}>
                            <div className={styles.detailLabel}>Attachments</div>
                            <ul className={styles.attachmentList}>
                                {task.attachments.map((file) => (
                                    <li key={file.id || file._id}>
                                        <a href={file.url} target="_blank" rel="noopener noreferrer" className={styles.attachmentLink}>
                                            {file.originalName || file.filename}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Current Column */}
                    <div className={styles.detailItem}>
                        <div className={styles.detailLabel}>Move to Column</div>
                        <select
                            value={selectedColumn}
                            onChange={e => setSelectedColumn(e.target.value)}
                            className={styles.columnSelect}
                        >
                            {columns.map(col => (
                                <option key={col._id || col.key} value={col._id || col.key}>{col.label || col.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Footer Buttons */}
                <footer className={styles.modalFooter}>
                    <button className={styles.buttonSecondary} onClick={onClose}>Cancel</button>
                    <button className={styles.buttonPrimary} onClick={handleMove}>Move Task</button>
                </footer>

                {/* Delete Confirmation Popup */}
                {showDeleteConfirm && (
                    <div className={styles.confirmBackdrop}>
                        <div className={styles.confirmBox}>
                            <h3 className={styles.confirmTitle}>Are you sure you want to delete this task?</h3>
                            <p className={styles.confirmText}>This action cannot be undone.</p>
                            <div className={styles.confirmActions}>
                                <button className={styles.buttonSecondary} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                                <button className={styles.buttonDelete} onClick={handleDelete}>Delete</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
