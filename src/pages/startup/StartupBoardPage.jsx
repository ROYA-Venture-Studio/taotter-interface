import React, { useMemo, useState } from "react";
import Breadcrumb from "../../components/ui/Breadcrumb/Breadcrumb";
import BoardKanban from "../../components/admin/BoardKanban";
import { useParams } from "react-router-dom";
import { useGetStartupBoardBySprintQuery } from "../../store/api/boardsApi";
import { useCreateStartupTaskMutation, useMoveStartupTaskMutation, useEditStartupTaskMutation, useDeleteStartupTaskMutation } from "../../store/api/tasksApi";
import TaskModal from "../../components/admin/TaskModal";
import TaskDetailsModal from "../../components/admin/TaskDetailsModal";
import "./StartupBoardPage.css";

const FILTERS = [
  { key: "all", label: "All Tasks" },
  { key: "todo", label: "To Do" },
  { key: "inprogress", label: "In Progress" },
  { key: "review", label: "Review" },
  { key: "done", label: "Done" }
];

const STATUS_MAPPING = {
  todo: "To Do",
  inprogress: "In Progress",
  review: "Review",
  done: "Done"
};

export default function StartupBoardPage() {
  const { sprintId } = useParams();
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null); // 'details' | 'edit' | 'create'
  const [selectedTask, setSelectedTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [localColumns, setLocalColumns] = useState([]);
  const [lastColumnsSnapshot, setLastColumnsSnapshot] = useState([]);

  // Fetch board by sprintId
  const { data, isLoading, error, refetch } = useGetStartupBoardBySprintQuery(sprintId);

  // Create, edit, and move task mutations
  const [createStartupTask, { isLoading: isCreating }] = useCreateStartupTaskMutation();
  const [editStartupTask] = useEditStartupTaskMutation();
  const [moveStartupTask] = useMoveStartupTaskMutation();
  const [deleteStartupTask] = useDeleteStartupTaskMutation();

  // Transform backend data to columns/tasks for BoardKanban
  const columns = useMemo(() => {
    if (!data?.data?.board) return [];
    const board = data.data.board;
    // Map columns and tasks
    return board.columns
      .filter(col => {
        if (filter === "all") return true;
        // Only show the selected column for the filter
        const name = col.name.toLowerCase();
        return (
          (filter === "todo" && name.includes("to do")) ||
          (filter === "inprogress" && name.includes("progress")) ||
          (filter === "review" && name.includes("review")) ||
          (filter === "done" && (name.includes("done") || name.includes("complete")))
        );
      })
      .map(col => {
        const tasks = (board.tasksByColumn[col._id] || []);
        return {
          key: col._id,
          label: col.name,
          tasks: tasks.map(task => ({
            ...task,
            id: task._id,
            avatar: task.assignee?.profile?.avatar || "/assets/icons/User.svg",
            date: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "",
            comments: task.comments?.length || 0,
            links: task.links?.length || 0,
            taskType: task.taskType || "General",
            status: task.status
          }))
        };
      });
  }, [data, filter]);

  // Sync localColumns with columns from backend on load/refetch/filter change
  React.useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  function handleCardClick(task) {
    setSelectedTask({ ...task, id: task.id || task._id });
    setEditTask(null);
    setModalMode('details');
    setModalOpen(true);
  }

  function handleEditTask(task) {
    setEditTask(task);
    setModalMode('edit');
    setModalOpen(true);
  }

  function handleCreateClick() {
    setSelectedTask(null);
    setEditTask(null);
    setModalMode('create');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setModalMode(null);
    setSelectedTask(null);
    setEditTask(null);
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
          const updatedTask = { ...taskToMove };
          col.tasks.splice(position, 0, updatedTask);
          return { ...col, tasks: [...col.tasks] };
        }
        return col;
      });
    });

    try {
      await moveStartupTask({ taskId, columnId: targetColumnId, position }).unwrap();
      refetch();
    } catch (err) {
      // Rollback on error
      setLocalColumns(lastColumnsSnapshot);
      alert("Failed to move task: " + (err?.data?.message || err.message));
    }
  };

  // Named delete handler for TaskDetailsModal (mimic admin)
  async function handleDeleteTask(taskId) {
    if (!taskId) return;
    try {
      await deleteStartupTask(taskId).unwrap();
      setShowDetailsModal(false);
      refetch();
    } catch (err) {
      alert("Failed to delete task: " + (err?.data?.message || err.message));
    }
  }

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
                      admins={[]}
                    />
                  )}
                  {(modalMode === 'edit' || modalMode === 'create') && (
                    <TaskModal
                      open={true}
                      onClose={closeModal}
                      onSubmit={async (taskData) => {
                        let formData;
                        if (taskData instanceof FormData) {
                          formData = taskData;
                          if (boardId) formData.append("boardId", boardId);
                          if (modalMode === 'edit' && editTask && (formData.get("taskId") == null) && editTask.id) {
                            formData.append("taskId", editTask.id);
                          }
                        } else {
                          formData = new FormData();
                          if (modalMode === 'edit' && editTask && taskData.id) {
                            formData.append("taskId", taskData.id);
                          }
                          if (boardId) formData.append("boardId", boardId);
                          if (taskData.title) formData.append("title", taskData.title);
                          if (taskData.description) formData.append("description", taskData.description);
                          if (taskData.columnId) formData.append("columnId", taskData.columnId);
                          else if (taskData.column) formData.append("columnId", taskData.column);
                          if (taskData.dueDate) formData.append("dueDate", taskData.dueDate);
                          if (taskData.taskType) formData.append("taskType", taskData.taskType);
                          if (taskData.priority) formData.append("priority", taskData.priority);
                          if (taskData.assigneeId) formData.append("assigneeId", taskData.assigneeId);
                          if (taskData.status) formData.append("status", taskData.status);
                          if (taskData.comments) formData.append("comments", taskData.comments);
                          if (taskData.links) formData.append("links", taskData.links);
                          if (taskData.attachments && Array.isArray(taskData.attachments)) {
                            taskData.attachments.forEach(file => {
                              if (file instanceof File) {
                                formData.append("attachments", file);
                              }
                            });
                          }
                        }
                        try {
                          if (modalMode === 'edit' && editTask && (formData.get("taskId") || formData.get("id"))) {
                            await editStartupTask({ taskId: formData.get("taskId") || formData.get("id"), formData }).unwrap();
                          } else {
                            await createStartupTask(formData).unwrap();
                          }
                          closeModal();
                          refetch();
                        } catch (err) {
                          alert("Failed to " + (modalMode === 'edit' ? "update" : "create") + " task: " + (err?.data?.message || err.message));
                        }
                      }}
                      taskToEdit={modalMode === 'edit' ? editTask : null}
                      columns={boardColumns}
                      admins={[]} // Empty array since startups can't assign
                      hideAssignment={true}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
  );
}
