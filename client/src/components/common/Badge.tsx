import type { TaskPriority } from '../../types';

interface PriorityBadgeProps {
  priority: TaskPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge = ({ priority, size = 'sm' }: PriorityBadgeProps) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  const config = {
    low: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    medium: 'bg-sky-50 text-sky-600 border-sky-200',
    high: 'bg-amber-50 text-amber-600 border-amber-200',
    urgent: 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse',
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
          ? 'bg-pink-50 text-pink-600 border-pink-200'
          : 'bg-slate-50 text-slate-500 border-slate-200'
      }`}
    >
      {role}
    </span>
  );
};
