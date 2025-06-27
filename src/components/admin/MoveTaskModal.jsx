import React, { useState } from "react";
import "./MoveTaskModal.css";

export default function MoveTaskModal({ 
  open, 
  onClose, 
  task, 
  columns, 
  onMoveTask,
  currentColumnId 
}) {
  const [selectedColumnId, setSelectedColumnId] = useState(currentColumnId || "");
  const [isMoving, setIsMoving] = useState(false);

  if (!open) return null;

  const handleMove = async () => {
    if (!selectedColumnId || selectedColumnId === currentColumnId) {
      onClose();
      return;
    }

    setIsMoving(true);
    try {
      await onMoveTask(task.id, selectedColumnId);
      onClose();
    } catch (error) {
      console.error("Failed to move task:", error);
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <div className="move-task-modal-backdrop" onClick={onClose}>
      <div className="move-task-modal" onClick={e => e.stopPropagation()}>
        <div className="move-task-modal-header">
          <h3>Move Task</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="move-task-modal-content">
          <div className="task-info">
            <h4>{task.title}</h4>
            <p>{task.description}</p>
          </div>
          
          <div className="column-selection">
            <label>Move to column:</label>
            <select
              value={selectedColumnId}
              onChange={(e) => setSelectedColumnId(e.target.value)}
              disabled={isMoving}
            >
              {columns.map(column => (
                <option key={column.key} value={column.key}>
                  {column.label}
                  {column.key === currentColumnId ? " (current)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="move-task-modal-actions">
          <button 
            className="cancel-btn" 
            onClick={onClose}
            disabled={isMoving}
          >
            Cancel
          </button>
          <button 
            className="move-btn" 
            onClick={handleMove}
            disabled={isMoving || selectedColumnId === currentColumnId}
          >
            {isMoving ? "Moving..." : "Move Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
