import React, { useMemo, useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import Breadcrumb from "../../components/ui/Breadcrumb/Breadcrumb";
import BoardKanban from "../../components/admin/BoardKanban";
import { useGetBoardBySprintQuery } from "../../store/api/boardsApi";
import PaymentRequiredModal from "../../components/ui/PaymentRequiredModal";
import { useParams, useNavigate } from "react-router-dom";
import TaskModal from "../../components/admin/TaskModal";
import { useCreateTaskMutation, useMoveTaskMutation, useDeleteTaskMutation, useEditTaskMutation } from "../../store/api/tasksApi";
import { useGetAdminUsersQuery } from "../../store/api/adminApi";
import "./BoardPage.css";

const FILTERS = [
  { key: "all", label: "All Tasks" },
  { key: "todo", label: "To Do" },
  { key: "inprogress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "completed", label: "Done" }
];

const STATUS_MAP = {
  todo: "todo",
  inprogress: "in_progress",
  review: "review",
  completed: "done",
};

export default function BoardPage() {
  // --- Optimistic UI: local columns state ---
  const [localColumns, setLocalColumns] = useState([]);
  const [lastColumnsSnapshot, setLastColumnsSnapshot] = useState([]);
  const { sprintId } = useParams(); // Assume route is /admin/board/:sprintId
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null); // 'details' | 'edit' | 'create'
  const [selectedTask, setSelectedTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const navigate = useNavigate();

  // Fetch board by sprintId (you may need to adjust this to fetch by boardId if needed)
  const { data, isLoading, error, refetch } = useGetBoardBySprintQuery(sprintId);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (error && error.status === 403 && error.data?.code === "PAYMENT_REQUIRED") {
      setShowPaymentModal(true);
    } else {
      setShowPaymentModal(false);
    }
  }, [error]);

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

    // Always show all columns, but filter tasks within each column by status if filter is active
    return board.columns.map(col => ({
      key: col._id,
      label: col.name,
      _id: col._id,
      tasks: (board.tasksByColumn[col._id] || []).filter(task =>
        filter === "all" ? true : STATUS_MAP[filter] ? task.status === STATUS_MAP[filter] : true
      ).map(task => ({
        ...task,
        id: task._id,
        avatar: task.assigneeId?.profile?.avatar || "/assets/icons/User.svg",
        date: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "",
        comments: task.comments?.length || 0,
        links: task.links?.length || 0,
        taskType: task.taskType || "General",
        attachments: task.attachments || [],
      }))
    }));
  }, [data, filter]);

  // Sync localColumns with columns from backend on load/refetch/filter change
  useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const boardId = data?.data?.board?.id;
  const boardColumns = data?.data?.board?.columns || [];

  const handleCreateTask = async (taskData) => {
    if (isEditMode && editTask && taskData.taskId) {
      // Edit mode: call editTaskMutation
      try {
        // Only send fields that are editable
        const payload = {
          taskId: taskData.taskId,
          title: taskData.title,
          description: taskData.description,
          columnId: taskData.columnId,
          dueDate: taskData.dueDate,
          taskType: taskData.taskType,
          priority: taskData.priority,
          assigneeId: taskData.assigneeId,
        };
        await editTaskMutation(payload).unwrap();
        setShowCreateModal(false);
        setEditTask(null);
        setIsEditMode(false);
        refetch();
      } catch (err) {
        alert("Failed to update task: " + (err?.data?.message || err.message));
      }
    } else {
      // Create mode
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
    }
  };

  // Edit task handler
  const handleCardClick = (task) => {
    setSelectedTask(task);
    setEditTask(null);
    setModalMode('details');
    setModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditTask(task);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedTask(null);
    setEditTask(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMode(null);
    setSelectedTask(null);
    setEditTask(null);
  };

  // RTK Query delete mutation
  const [deleteTask] = useDeleteTaskMutation();
  // RTK Query edit mutation
  const [editTaskMutation] = useEditTaskMutation();

  // Delete task handler
  const handleDeleteTask = async (taskId) => {
    console.log("handleDeleteTask called with:", taskId);
    if (!taskId) return;
    try {
      await deleteTask(taskId).unwrap();
      console.log("Task deleted:", taskId);
      refetch();
    } catch (err) {
      alert("Failed to delete task: " + (err?.data?.message || err.message));
    }
  };

  // Move task handler for drag-and-drop (optimistic UI)
  const handleMoveTask = async (taskId, targetColumnId) => {
    // Find the target column and the new position (end of column)
    const col = localColumns.find(c => c.key === targetColumnId);
    const position = col ? col.tasks.length : 0;

    // Optimistically update localColumns
    setLastColumnsSnapshot(localColumns);
    setLocalColumns(prevCols => {
      // Remove task from its current column
      let taskToMove = null;
      const newCols = prevCols.map(col => {
        const filtered = col.tasks.filter(t => {
          if (t.id === taskId) {
            taskToMove = t;
            return false;
          }
          return true;
        });
        return { ...col, tasks: filtered };
      });
      // Add task to target column at new position
      return newCols.map(col => {
        if (col.key === targetColumnId && taskToMove) {
          // Optionally update status if needed
          const updatedTask = { ...taskToMove };
          col.tasks.splice(position, 0, updatedTask);
          return { ...col, tasks: [...col.tasks] };
        }
        return col;
      });
    });

    try {
      await moveTask({ taskId, columnId: targetColumnId, position }).unwrap();
      refetch();
    } catch (err) {
      // Rollback on error
      setLocalColumns(lastColumnsSnapshot);
      alert("Failed to move task: " + (err?.data?.message || err.message));
    }
  };

  return (
    <AdminLayout>
      <PaymentRequiredModal open={showPaymentModal} onClose={() => navigate("/admin/sprints")} />
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
              onClick={handleCreateClick}
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
            <>
              <BoardKanban
                columns={localColumns}
                onMoveTask={handleMoveTask}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onCardClick={handleCardClick}
              />
              {modalOpen && (
                <div>
                  {modalMode === 'details' && selectedTask && (
                    <TaskDetailsModal
                      open={true}
                      onClose={closeModal}
                      task={selectedTask}
                      columns={boardColumns}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                      onMoveTask={null}
                      currentColumnId={selectedTask?.columnId}
                      admins={admins}
                    />
                  )}
                  {(modalMode === 'edit' || modalMode === 'create') && (
                    <TaskModal
                      open={true}
                      onClose={closeModal}
                      onSubmit={async (taskData) => {
                        const formData = taskData instanceof FormData ? taskData : new FormData();
                        if (!(taskData instanceof FormData)) {
                          Object.entries(taskData).forEach(([key, value]) => {
                            formData.append(key, value);
                          });
                        }
                        formData.append('boardId', boardId);

                        try {
                          if (modalMode === 'edit' && editTask && (formData.get('taskId') || formData.get('id') || editTask.id)) {
                            const taskId = formData.get('taskId') || formData.get('id') || editTask.id;
                            await editTaskMutation({ taskId, formData }).unwrap();
                          } else {
                            await createTask(formData).unwrap();
                          }
                          closeModal();
                          refetch();
                        } catch (err) {
                          alert("Failed to " + (modalMode === 'edit' ? "update" : "create") + " task: " + (err?.data?.message || err.message));
                        }
                      }}
                      taskToEdit={modalMode === 'edit' ? editTask : null}
                      columns={boardColumns}
                      admins={admins}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
