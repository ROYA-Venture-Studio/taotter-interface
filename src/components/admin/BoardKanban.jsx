import React, { useState } from "react";
import BoardTaskCard from "./BoardTaskCard";
import "./BoardKanban.css";

export default function BoardKanban({ columns, onMoveTask, onEditTask, onDeleteTask }) {
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
    <div className="board-kanban">
      {columns.map(col => (
        <div
          key={col.key}
          className="board-kanban-col"
          onDragOver={e => e.preventDefault()}
          onDrop={() => handleDrop(col.key)}
        >
          <div className="board-kanban-col-header">{col.label}</div>
          <div className="board-kanban-col-list">
            {col.tasks.map(task => (
              <BoardTaskCard
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
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
