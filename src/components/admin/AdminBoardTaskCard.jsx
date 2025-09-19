import React from "react";
import "./AdminBoardTaskCard.css";

export default function AdminBoardTaskCard({
  task,
  draggable,
  onDragStart,
  onDragEnd,
  columns,
  onMoveTask,
  currentColumnId,
  onEditTask,
  onDeleteTask,
  onCardClick
}) {
  return (
    <div
      className="admin-board-task-card"
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="admin-board-task-card__top">
        <div className="admin-board-task-card__title">{task.title}</div>
        <img src={task.avatar} alt="avatar" className="admin-board-task-card__avatar" />
        <button
          className="admin-board-task-card__menu-btn"
          onClick={e => {
            e.stopPropagation();
            if (onCardClick) onCardClick(task);
          }}
          aria-label="Task options"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="3" r="1.5" fill="currentColor"/>
            <circle cx="10" cy="10" r="1.5" fill="currentColor"/>
            <circle cx="10" cy="17" r="1.5" fill="currentColor"/>
          </svg>
        </button>
      </div>
      <div className="admin-board-task-card__body">
        <div className="admin-board-task-card__description">{task.description}</div>
        {task.createdByName && (
          <div className="admin-board-task-card__created-by">
            Created by: {task.createdByName}
          </div>
        )}
        {task.taskType && (
          <div className="admin-board-task-card__pill-row">
            <span className="admin-board-task-card__pill admin-board-task-card__pill--general">
              {task.taskType}
            </span>
          </div>
        )}
      </div>
      <div className="admin-board-task-card__bottom">
        <div className="admin-board-task-card__date">{task.date}</div>
        <div className="admin-board-task-card__stats">
          <span className="admin-board-task-card__comments">{task.comments}</span>
          <span className="admin-board-task-card__links">{task.links}</span>
        </div>
      </div>
    </div>
  );
}