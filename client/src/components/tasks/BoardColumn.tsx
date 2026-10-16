import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { ITask, IBoardColumn } from '../../types';
import { TaskCard } from './TaskCard';

interface BoardColumnProps {
  column: IBoardColumn;
  tasks: ITask[];
  canEdit: boolean;
  onAddTask: (columnId: string) => void;
  onEditTask: (task: ITask) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleComplete: (task: ITask) => void;
  onDragStart: (e: React.DragEvent, task: ITask) => void;
  onDropTask: (e: React.DragEvent, targetColumnId: string) => void;
}

export const BoardColumn = ({
  column,
  tasks,
  canEdit,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
  onDragStart,
  onDropTask,
}: BoardColumnProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (canEdit && !isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (canEdit) {
      onDropTask(e, column.id);
    }
  };

  const columnAccents: Record<string, { header: string; dot: string; badge: string }> = {
    todo: {
      header: 'text-pink-600',
      dot: 'bg-pink-400',
      badge: 'bg-pink-50 text-pink-600 border-pink-200',
    },
    'in-progress': {
      header: 'text-amber-600',
      dot: 'bg-amber-400',
      badge: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    done: {
      header: 'text-emerald-600',
      dot: 'bg-emerald-400',
      badge: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
  };

  const accent = columnAccents[column.id] || {
    header: 'text-slate-600',
    dot: 'bg-slate-400',
    badge: 'bg-slate-50 text-slate-500 border-slate-200',
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col flex-1 min-w-[280px] max-w-sm rounded-2xl bg-white border p-4 transition-all duration-200 shadow-sm ${
        isDragOver
          ? 'border-pink-400/60 ring-2 ring-pink-300/30 bg-pink-50/30'
          : 'border-pink-100'
      }`}
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-pink-50">
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full ${accent.dot}`} />
          <h3 className={`font-semibold text-sm ${accent.header}`}>{column.name}</h3>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold border ${accent.badge}`}
          >
            {tasks.length}
          </span>
        </div>

        {canEdit && (
          <button
            onClick={() => onAddTask(column.id)}
            className="p-1.5 text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
            title={`Add task to ${column.name}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto min-h-[300px]">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            canEdit={canEdit}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onToggleComplete={onToggleComplete}
            onDragStart={onDragStart}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-pink-100 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-400 font-medium">No tasks in {column.name}</p>
            {canEdit && (
              <button
                onClick={() => onAddTask(column.id)}
                className="mt-2 text-xs font-semibold text-pink-400 hover:text-pink-500"
              >
                + Create one
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
