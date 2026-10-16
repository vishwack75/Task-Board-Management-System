import { Search, Filter, X } from 'lucide-react';

interface TaskFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  priority: string;
  onPriorityChange: (val: string) => void;
  dueDate: string;
  onDueDateChange: (val: string) => void;
  onClearFilters: () => void;
}

export const TaskFilterBar = ({
  search,
  onSearchChange,
  priority,
  onPriorityChange,
  dueDate,
  onDueDateChange,
  onClearFilters,
}: TaskFilterBarProps) => {
  const hasActiveFilters = Boolean(search || priority || dueDate);

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search tasks by title..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-800/60 border border-zinc-700/60 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800/60 border border-zinc-700/60 text-xs font-medium text-zinc-400">
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          <span>Filters:</span>
        </div>

        <select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="px-3 py-2 rounded-xl bg-zinc-800/60 border border-zinc-700/60 text-xs font-medium text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={dueDate}
          onChange={(e) => onDueDateChange(e.target.value)}
          className="px-3 py-2 rounded-xl bg-zinc-800/60 border border-zinc-700/60 text-xs font-medium text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          <option value="">All Due Dates</option>
          <option value="today">Due Today</option>
          <option value="this_week">Due This Week</option>
          <option value="overdue">Overdue</option>
          <option value="has_due_date">Has Due Date</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
            title="Clear filters"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
