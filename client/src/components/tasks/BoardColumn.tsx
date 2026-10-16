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

  const columnAccents: Record<string, { bg: string; dot: string }> = {
    todo: { bg: 'bg-indigo-500/10 text-indigo-400', dot: 'bg-indigo-500' },
    'in-progress': { bg: 'bg-amber-500/10 text-amber-400', dot: 'bg-amber-500' },
    done: { bg: 'bg-emerald-500/10 text-emerald-400', dot: 'bg-emerald-500' },
  };

  const accent = columnAccents[column.id] || {
    bg: 'bg-zinc-500/10 text-zinc-400',
    dot: 'bg-zinc-400',
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col flex-1 min-w-[280px] max-w-sm rounded-2xl bg-zinc-950/60 border p-4 transition-all duration-200 ${
        isDragOver
          ? 'border-indigo-500/60 ring-2 ring-indigo-500/20 bg-zinc-900/40'
          : 'border-zinc-800/80'
      }`}
    >
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-850">
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full ${accent.dot}`} />
          <h3 className="font-semibold text-sm text-zinc-200">{column.name}</h3>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${accent.bg}`}
          >
            {tasks.length}
          </span>
        </div>

        {canEdit && (
          <button
            onClick={() => onAddTask(column.id)}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
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
          <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-zinc-800/80 rounded-xl p-4 text-center">
            <p className="text-xs text-zinc-500 font-medium">No tasks in {column.name}</p>
            {canEdit && (
              <button
                onClick={() => onAddTask(column.id)}
                className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
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
