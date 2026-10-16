import React from 'react';
import { Calendar, MoreVertical, GripVertical, CheckCircle2, Circle } from 'lucide-react';
import type { ITask } from '../../types';
import { PriorityBadge } from '../common/Badge';

interface TaskCardProps {
  task: ITask;
  canEdit: boolean;
  onEdit: (task: ITask) => void;
  onDelete: (taskId: string) => void;
  onToggleComplete: (task: ITask) => void;
  onDragStart: (e: React.DragEvent, task: ITask) => void;
  onDragOver?: (e: React.DragEvent) => void;
}

export const TaskCard = ({
  task,
  canEdit,
  onEdit,
  onDelete,
  onToggleComplete,
  onDragStart,
}: TaskCardProps) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const isOverdue =
    Boolean(task.dueDate) &&
    !task.isCompleted &&
    new Date(task.dueDate!).getTime() < Date.now();

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div
      draggable={canEdit}
      onDragStart={(e) => onDragStart(e, task)}
      className={`group relative rounded-xl bg-zinc-900 border p-4 shadow-sm transition-all duration-200 select-none ${
        canEdit ? 'cursor-grab active:cursor-grabbing hover:shadow-md hover:border-zinc-700' : ''
      } ${
        task.isCompleted
          ? 'border-emerald-500/20 bg-zinc-900/40 opacity-75'
          : isOverdue
          ? 'border-rose-500/40 bg-zinc-900'
          : 'border-zinc-800'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          {canEdit && (
            <div className="text-zinc-600 group-hover:text-zinc-400 cursor-grab active:cursor-grabbing transition-colors -ml-1">
              <GripVertical className="w-4 h-4" />
            </div>
          )}
          <PriorityBadge priority={task.priority} />
        </div>

        <div className="relative">
          {canEdit && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          )}

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-32 rounded-xl bg-zinc-800 border border-zinc-700 shadow-xl py-1 z-30"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(task);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700/60"
              >
                Edit Task
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(task._id);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10"
              >
                Delete Task
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2.5 mb-2">
        <button
          onClick={() => canEdit && onToggleComplete(task)}
          disabled={!canEdit}
          className="mt-0.5 text-zinc-500 hover:text-emerald-400 transition-colors disabled:cursor-default"
        >
          {task.isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <Circle className="w-4 h-4" />
          )}
        </button>
        <h4
          className={`text-sm font-semibold leading-snug ${
            task.isCompleted
              ? 'line-through text-zinc-500'
              : 'text-zinc-100 group-hover:text-white'
          }`}
        >
          {task.title}
        </h4>
      </div>

      {task.description && (
        <p className="text-xs text-zinc-400 line-clamp-2 mb-3 pl-6">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800/80 text-xs text-zinc-400">
        {formattedDueDate ? (
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium ${
              isOverdue
                ? 'bg-rose-500/10 text-rose-400'
                : task.isCompleted
                ? 'text-zinc-500'
                : 'text-zinc-400 bg-zinc-800/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDueDate}</span>
            {isOverdue && <span className="font-bold text-[10px] ml-0.5">OVERDUE</span>}
          </div>
        ) : (
          <div />
        )}

        {task.creator && (
          <div
            className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center text-[10px] font-bold"
            title={`Created by ${task.creator.name}`}
          >
            {task.creator.name ? task.creator.name[0].toUpperCase() : 'U'}
          </div>
        )}
      </div>
    </div>
  );
};
