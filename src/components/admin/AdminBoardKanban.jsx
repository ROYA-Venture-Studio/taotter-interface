import React, { useState } from "react";
import AdminBoardTaskCard from "./AdminBoardTaskCard";
import "./AdminBoardKanban.css";

export default function AdminBoardKanban({ columns, onMoveTask, onEditTask, onDeleteTask, onCardClick }) {
  const [dragged, setDragged] = useState(null);

  function handleDragStart(taskId) {
    setDragged(taskId);
  }
  function handleDragEnd() {
    setDragged(null);
  }
  function handleDrop(colKey) {
    if (dragged) {
      onMoveTask(dragged, colKey);
      setDragged(null);
    }
  }

  return (
    <div className="admin-board-kanban">
      {columns.map(col => (
        <div
          key={col.key}
          className="admin-board-kanban-col"
          onDragOver={e => e.preventDefault()}
          onDrop={() => handleDrop(col.key)}
        >
          <div className="admin-board-kanban-col-header">{col.label}</div>
          <div className="admin-board-kanban-col-list">
            {col.tasks.map(task => (
              <AdminBoardTaskCard
                key={task.id}
                task={task}
                draggable
                onDragStart={() => handleDragStart(task.id)}
                onDragEnd={handleDragEnd}
                columns={columns}
                onMoveTask={onMoveTask}
                currentColumnId={col.key}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onCardClick={onCardClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}