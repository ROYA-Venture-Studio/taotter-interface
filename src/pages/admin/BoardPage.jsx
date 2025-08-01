import React, { useMemo, useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import Breadcrumb from "../../components/ui/Breadcrumb/Breadcrumb";
import BoardKanban from "../../components/admin/BoardKanban";
import { useGetBoardBySprintQuery } from "../../store/api/boardsApi";
import { useParams } from "react-router-dom";
import CreateTaskModal from "../../components/admin/CreateTaskModal";
import { useCreateTaskMutation, useMoveTaskMutation } from "../../store/api/tasksApi";
import { useGetAdminUsersQuery } from "../../store/api/adminApi";
import "./BoardPage.css";

const FILTERS = [
  { key: "all", label: "All Tasks" },
  { key: "todo", label: "To Do" },
  { key: "inprogress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "completed", label: "Completed" }
];

const STATUS_MAP = {
  todo: "todo",
  inprogress: "in_progress",
  review: "review",
  completed: "done",
};

export default function BoardPage() {
  const { sprintId } = useParams(); // Assume route is /admin/board/:sprintId
  const [filter, setFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch board by sprintId (you may need to adjust this to fetch by boardId if needed)
  const { data, isLoading, error, refetch } = useGetBoardBySprintQuery(sprintId);

  // Fetch all admins for assignment
  const { data: adminsData, isLoading: adminsLoading } = useGetAdminUsersQuery();
  const admins = adminsData?.data?.users || [];

  // Create task mutation
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();

  // Move task mutation
  const [moveTask] = useMoveTaskMutation();

  // Transform backend data to columns/tasks for BoardKanban
  const columns = useMemo(() => {
    if (!data?.data?.board) return [];
    const board = data.data.board;
    return board.columns.map(col => ({
      key: col._id,
      label: col.name,
      _id: col._id,
      tasks: (board.tasksByColumn[col._id] || [])
        .filter(t => filter === "all" ? true : STATUS_MAP[filter] ? t.status === STATUS_MAP[filter] : true)
        .map(task => ({
          id: task._id,
          title: task.title,
          description: task.description,
          avatar: task.assignee?.profile?.avatar || "/assets/icons/User.svg",
          date: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "",
          comments: task.comments?.length || 0,
          links: task.links?.length || 0,
          category: task.category || "General",
          status: task.status,
          position: task.position,
          columnId: task.columnId,
        }))
    }));
  }, [data, filter]);

  const boardId = data?.data?.board?.id;
  const boardColumns = data?.data?.board?.columns || [];

  const handleCreateTask = async (taskData) => {
    if (!boardId) return;
    // Find a valid admin userId for watcher (fallback to first admin if none selected)
    let watcherUserId = taskData.assigneeId;
    if (!watcherUserId && admins.length > 0) watcherUserId = admins[0]._id;
    // Only send watchers if we have a valid userId
    let watchers = undefined;
    if (watcherUserId) {
      watchers = [
        {
          userId: watcherUserId,
          userModel: "Admin"
        }
      ];
    }
    try {
      // Always send a valid status
      let status = "todo";
      if (taskData.columnId) {
        const col = boardColumns.find(c => c._id === taskData.columnId);
        if (col && col.name) {
          // Map column name to status if possible
          const name = col.name.toLowerCase().replace(/\s/g, "");
          if (name.includes("progress")) status = "in_progress";
          else if (name.includes("review")) status = "review";
          else if (name.includes("done") || name.includes("complete")) status = "done";
          else status = "todo";
        }
      }
      const payload = {
        boardId,
        title: taskData.title,
        description: taskData.description,
        columnId: taskData.columnId,
        dueDate: taskData.dueDate,
        taskType: taskData.taskType,
        priority: taskData.priority,
        assigneeId: taskData.assigneeId,
        createdByModel: "Admin",
        status,
      };
      if (watchers) payload.watchers = watchers;
      await createTask(payload).unwrap();
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
      await moveTask({ taskId, columnId: targetColumnId, position }).unwrap();
      refetch();
    } catch (err) {
      alert("Failed to move task: " + (err?.data?.message || err.message));
    }
  };

  return (
    <AdminLayout>
      <div className="board-page">
        <div className="board-page-header-row">
          <div className="board-page-title">Board</div>
          <div className="board-page-breadcrumb">
            <Breadcrumb
              items={[
                { label: "Home", href: "/admin/dashboard" },
                { label: "Board", href: `/admin/board/${sprintId}`, isActive: true }
              ]}
            />
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
              disabled={adminsLoading}
            >
              + New Task
            </button>
          </div>
          {isLoading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error loading board</div>
          ) : (
            <BoardKanban columns={columns} onMoveTask={handleMoveTask} />
          )}
        </div>
      </div>
      <CreateTaskModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateTask}
        columns={boardColumns}
        admins={admins}
      />
    </AdminLayout>
  );
}
