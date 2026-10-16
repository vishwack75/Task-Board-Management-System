import React, { useState, useEffect } from 'react';
import {
  Plus,
  Share2,
  Trash2,
  Edit2,
  Kanban,
  Eye,
  Shield,
  Layers,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { StatCards } from '../../components/dashboard/StatCards';
import { BoardColumn } from '../../components/tasks/BoardColumn';
import { TaskFilterBar } from '../../components/tasks/TaskFilterBar';
import { BoardModal } from '../../components/boards/BoardModal';
import { ShareBoardModal } from '../../components/boards/ShareBoardModal';
import { TaskModal } from '../../components/tasks/TaskModal';
import type { IBoard, ITask } from '../../types';
import {
  useGetBoardsQuery,
  useGetDashboardSummaryQuery,
  useGetTasksQuery,
  useDeleteBoardMutation,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
  useReorderTasksMutation,
} from '../../store/services/apiSlice';

export const HomePage = () => {
  const { data: boardsData, isLoading: isBoardsLoading } = useGetBoardsQuery();
  const { data: summaryData, isLoading: isSummaryLoading } = useGetDashboardSummaryQuery();

  const [deleteBoard] = useDeleteBoardMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [reorderTasks] = useReorderTasksMutation();

  const boards = boardsData?.data || [];
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');

  useEffect(() => {
    if (boards.length > 0 && !selectedBoardId) {
      setSelectedBoardId(boards[0]._id);
    } else if (
      boards.length > 0 &&
      !boards.some((b) => b._id === selectedBoardId)
    ) {
      setSelectedBoardId(boards[0]._id);
    }
  }, [boards, selectedBoardId]);

  const activeBoard: IBoard | undefined = boards.find(
    (b) => b._id === selectedBoardId
  );

  const canEditBoard =
    activeBoard?.isOwner || activeBoard?.userRole === 'editor';

  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');

  const { data: tasksData, isLoading: isTasksLoading } = useGetTasksQuery(
    {
      boardId: selectedBoardId,
      search: search || undefined,
      priority: priority || undefined,
      dueDate: dueDate || undefined,
    },
    { skip: !selectedBoardId }
  );

  const tasks = tasksData?.data || [];

  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [boardToEdit, setBoardToEdit] = useState<IBoard | null>(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ITask | null>(null);
  const [targetColumnId, setTargetColumnId] = useState<string>('todo');

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDeleteBoard = async (boardId: string) => {
    if (window.confirm('Are you sure you want to delete this board and all its tasks?')) {
      try {
        await deleteBoard(boardId).unwrap();
        if (selectedBoardId === boardId) {
          const remaining = boards.filter((b) => b._id !== boardId);
          setSelectedBoardId(remaining.length > 0 ? remaining[0]._id : '');
        }
      } catch {
      }
    }
  };

  const handleAddTask = (columnId: string) => {
    setTaskToEdit(null);
    setTargetColumnId(columnId);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: ITask) => {
    setTaskToEdit(task);
    setTargetColumnId(task.columnId);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask({ id: taskId, boardId: selectedBoardId }).unwrap();
      } catch {
      }
    }
  };

  const handleToggleComplete = async (task: ITask) => {
    const nextCompleted = !task.isCompleted;
    const nextColumn = nextCompleted ? 'done' : 'todo';
    try {
      await updateTask({
        id: task._id,
        isCompleted: nextCompleted,
        columnId: nextColumn,
      }).unwrap();
    } catch {
    }
  };

  const handleDragStart = (e: React.DragEvent, task: ITask) => {
    e.dataTransfer.setData('text/plain', task._id);
    setDraggedTaskId(task._id);
  };

  const handleDropTask = async (e: React.DragEvent, columnId: string) => {
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);

    if (!taskId || !activeBoard) return;

    const draggedTask = tasks.find((t) => t._id === taskId);
    if (!draggedTask) return;

    const columnTasks = tasks.filter(
      (t) => t.columnId === columnId && t._id !== taskId
    );

    const reorderedItems = [
      ...columnTasks.map((t, idx) => ({
        taskId: t._id,
        columnId,
        order: idx,
      })),
      {
        taskId,
        columnId,
        order: columnTasks.length,
      },
    ];

    try {
      await reorderTasks({
        boardId: activeBoard._id,
        items: reorderedItems,
      }).unwrap();
    } catch {
    }
  };

  const columns = activeBoard?.columns || [
    { id: 'todo', name: 'To Do', order: 0 },
    { id: 'in-progress', name: 'In Progress', order: 1 },
    { id: 'done', name: 'Done', order: 2 },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatCards data={summaryData?.data} isLoading={isSummaryLoading} />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-none">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 shrink-0">
              <Layers className="w-4 h-4 text-indigo-400" />
              Boards:
            </span>

            {boards.map((b) => {
              const isSelected = b._id === selectedBoardId;
              return (
                <button
                  key={b._id}
                  onClick={() => setSelectedBoardId(b._id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-zinc-800 text-white shadow-md border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: b.color || '#6366f1' }}
                  />
                  <span>{b.title}</span>
                  {!b.isOwner && (
                    <span className="text-[10px] text-zinc-500 uppercase">
                      (shared)
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => {
                setBoardToEdit(null);
                setIsBoardModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Board</span>
            </button>
          </div>

          {activeBoard && (
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              {activeBoard.isOwner && (
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Share Board</span>
                </button>
              )}

              {canEditBoard && (
                <button
                  onClick={() => {
                    setBoardToEdit(activeBoard);
                    setIsBoardModalOpen(true);
                  }}
                  className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors border border-zinc-800"
                  title="Edit board details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}

              {activeBoard.isOwner && (
                <button
                  onClick={() => handleDeleteBoard(activeBoard._id)}
                  className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-zinc-800 hover:border-rose-500/30"
                  title="Delete board"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {activeBoard ? (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: activeBoard.color || '#6366f1' }}
                  />
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {activeBoard.title}
                  </h2>

                  {activeBoard.userRole === 'viewer' && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                      <Eye className="w-3 h-3" />
                      View Only
                    </span>
                  )}
                  {activeBoard.isOwner && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Shield className="w-3 h-3" />
                      Owner
                    </span>
                  )}
                </div>

                {activeBoard.description && (
                  <p className="text-xs text-zinc-400 mt-1">
                    {activeBoard.description}
                  </p>
                )}
              </div>

              {canEditBoard && (
                <button
                  onClick={() => handleAddTask('todo')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              )}
            </div>

            <TaskFilterBar
              search={search}
              onSearchChange={setSearch}
              priority={priority}
              onPriorityChange={setPriority}
              dueDate={dueDate}
              onDueDateChange={setDueDate}
              onClearFilters={() => {
                setSearch('');
                setPriority('');
                setDueDate('');
              }}
            />

            {isTasksLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-96 rounded-2xl bg-zinc-900/50 border border-zinc-800 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin">
                {columns.map((column) => {
                  const columnTasks = tasks
                    .filter((t) => t.columnId === column.id)
                    .sort((a, b) => a.order - b.order);

                  return (
                    <BoardColumn
                      key={column.id}
                      column={column}
                      tasks={columnTasks}
                      canEdit={canEditBoard}
                      onAddTask={handleAddTask}
                      onEditTask={handleEditTask}
                      onDeleteTask={handleDeleteTask}
                      onToggleComplete={handleToggleComplete}
                      onDragStart={handleDragStart}
                      onDropTask={handleDropTask}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ) : isBoardsLoading ? (
          <div className="h-96 rounded-3xl bg-zinc-900/40 border border-zinc-800 animate-pulse" />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl bg-zinc-900/30 border border-zinc-800/80 text-center">
            <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-4">
              <Kanban className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No boards created yet</h3>
            <p className="text-sm text-zinc-400 max-w-sm mb-6">
              Get started by creating your first task board to organize tasks and collaborate.
            </p>
            <button
              onClick={() => {
                setBoardToEdit(null);
                setIsBoardModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Board</span>
            </button>
          </div>
        )}
      </main>

      <BoardModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
        boardToEdit={boardToEdit}
        onSuccess={(id) => setSelectedBoardId(id)}
      />

      <ShareBoardModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        board={activeBoard || null}
      />

      {activeBoard && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          boardId={activeBoard._id}
          columns={columns}
          defaultColumnId={targetColumnId}
          taskToEdit={taskToEdit}
        />
      )}
    </div>
  );
};
