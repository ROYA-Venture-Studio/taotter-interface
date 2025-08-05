import React, { useMemo, useState } from "react";
import Breadcrumb from "../../components/ui/Breadcrumb/Breadcrumb";
import BoardKanban from "../../components/admin/BoardKanban";
import { useParams } from "react-router-dom";
import { useGetStartupBoardBySprintQuery } from "../../store/api/boardsApi";
import { useCreateStartupTaskMutation, useMoveStartupTaskMutation } from "../../store/api/tasksApi";
import CreateTaskModal from "../../components/admin/CreateTaskModal";
import "./StartupBoardPage.css";

const FILTERS = [
  { key: "all", label: "All Tasks" },
  { key: "todo", label: "To Do" },
  { key: "inprogress", label: "In Progress" },
  { key: "completed", label: "Completed" }
];

const STATUS_MAPPING = {
  todo: "To Do",
  inprogress: "In Progress",
  completed: "Completed"
};

export default function StartupBoardPage() {
  const { sprintId } = useParams();
  const [filter, setFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch board by sprintId
  const { data, isLoading, error, refetch } = useGetStartupBoardBySprintQuery(sprintId);

  // Create and move task mutations
  const [createStartupTask, { isLoading: isCreating }] = useCreateStartupTaskMutation();
  const [moveStartupTask] = useMoveStartupTaskMutation();

  // Transform backend data to columns/tasks for BoardKanban
  const columns = useMemo(() => {
    if (!data?.data?.board) return [];
    const board = data.data.board;
    // Map columns and tasks
    return board.columns
      .filter(col => {
        if (filter === "all") return true;
        // Only show the selected column for the filter
        return (
          (filter === "todo" && col.name.toLowerCase().includes("to do")) ||
          (filter === "inprogress" && col.name.toLowerCase().includes("progress")) ||
          (filter === "completed" && col.name.toLowerCase().includes("complete"))
        );
      })
      .map(col => {
        const tasks = (board.tasksByColumn[col._id] || []);
        return {
          key: col._id,
          label: col.name,
          tasks: tasks.map(task => ({
            id: task._id,
            title: task.title,
            description: task.description,
            avatar: task.assignee?.profile?.avatar || "/assets/icons/User.svg",
            date: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "",
            comments: task.comments?.length || 0,
            links: task.links?.length || 0,
            category: task.category || "General",
            status: task.status
          }))
        };
      });
  }, [data, filter]);

  function handleCardClick(task) {
    setSelectedTask(task);
  }

  function closeModal() {
    setSelectedTask(null);
  }

  const boardId = data?.data?.board?.id;
  const boardColumns = data?.data?.board?.columns || [];

  const handleCreateTask = async (taskData) => {
    if (!boardId) return;
    
    try {
      const payload = {
        boardId,
        title: taskData.title,
        description: taskData.description,
        columnId: taskData.columnId,
        dueDate: taskData.dueDate,
        taskType: taskData.taskType,
        priority: taskData.priority,
      };
      
      await createStartupTask(payload).unwrap();
      setShowCreateModal(false);
      refetch();
    } catch (err) {
      alert("Failed to create task: " + (err?.data?.message || err.message));
    }
  };

  // Move task handler for drag-and-drop
  const handleMoveTask = async (taskId, targetColumnId) => {
    // Find the target column and the new position (end of column)
    const col = columns.find(c => c.key === targetColumnId);
    const position = col ? col.tasks.length : 0;
    
    try {
      await moveStartupTask({ taskId, columnId: targetColumnId, position }).unwrap();
      refetch();
    } catch (err) {
      alert("Failed to move task: " + (err?.data?.message || err.message));
    }
  };

  return (
    <div className="board-page">
        <div className="board-page-header-row">
          <div className="board-page-title">Sprint Board</div>
          <div className="board-page-breadcrumb">
            {/* <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Sprints", href: "/startup/sprints" },
                { label: `Sprint ${sprintId}`, href: `/startup/sprint/${sprintId}/board`, isActive: true }
              ]}
            /> */}
          </div>
        </div>
        <div className="board-main-container">
          <div className="board-toolbar">
            <div className="board-toolbar-tabs">
              {FILTERS.map(tab => (
                <button
                  key={tab.key}
                  className={`board-toolbar-tab${filter === tab.key ? " active" : ""}`}
                  onClick={() => setFilter(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              className="create-task-btn"
              onClick={() => setShowCreateModal(true)}
              style={{
                marginLeft: "auto",
                background: "#EB5E28",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "1rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.2s"
              }}
              disabled={isCreating}
            >
              + New Task
            </button>
          </div>
          {isLoading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error loading board</div>
          ) : (
            <BoardKanban
              columns={columns}
              onMoveTask={handleMoveTask}
              onCardClick={handleCardClick}
            />
          )}
        </div>
        {selectedTask && (
          <div className="kanban-modal-overlay" onClick={closeModal}>
            <div className="kanban-modal" onClick={e => e.stopPropagation()}>
              <h2>{selectedTask.title}</h2>
              <p>{selectedTask.description}</p>
              <div>Category: {selectedTask.category}</div>
              <div>Due: {selectedTask.date}</div>
              <div>Comments: {selectedTask.comments}</div>
              <div>Links: {selectedTask.links}</div>
              <div>Assigned Admin: <img src={selectedTask.avatar} alt="Admin" style={{ width: 32, borderRadius: "50%" }} /></div>
              <button onClick={closeModal}>Close</button>
            </div>
          </div>
        )}
        <CreateTaskModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTask}
          columns={boardColumns}
          admins={[]} // Empty array since startups can't assign
          hideAssignment={true}
        />
      </div>
  );
}
