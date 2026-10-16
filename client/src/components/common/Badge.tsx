import type { TaskPriority } from '../../types';

interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge = ({ priority, size = 'sm' }: PriorityBadgeProps) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  const config = {
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    medium: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    urgent: 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border capitalize ${config[priority]} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {priority}
    </span>
  );
};

export const RoleBadge = ({ role }: { role: string }) => {
  const isEditor = role === 'editor' || role === 'owner';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize border ${
        isEditor
          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
          : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
      }`}
    >
      {role}
    </span>
  );
};
