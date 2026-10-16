import { CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react';
import type { IDashboardSummary } from '../../types';

interface StatCardsProps {
  data?: IDashboardSummary;
  isLoading: boolean;
}

export const StatCards = ({ data, isLoading }: StatCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const summary = data?.summary || {
    totalBoards: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
  };

  const cards = [
    {
      title: 'Total Tasks',
      value: summary.totalTasks,
      subtitle: `${summary.totalBoards} active boards`,
      icon: Layers,
      gradient: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
      borderColor: 'group-hover:border-indigo-500/40',
      iconColor: 'text-indigo-400 bg-indigo-500/10',
    },
    {
      title: 'Completed',
      value: summary.completedTasks,
      subtitle: `${summary.completionRate}% completion rate`,
      icon: CheckCircle2,
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      borderColor: 'group-hover:border-emerald-500/40',
      iconColor: 'text-emerald-400 bg-emerald-500/10',
    },
    {
      title: 'Pending',
      value: summary.totalTasks - summary.completedTasks,
      subtitle: 'In progress or to do',
      icon: Clock,
      gradient: 'from-sky-500/10 via-sky-500/5 to-transparent',
      borderColor: 'group-hover:border-sky-500/40',
      iconColor: 'text-sky-400 bg-sky-500/10',
    },
    {
      title: 'Overdue',
      value: summary.overdueTasks,
      subtitle: summary.overdueTasks > 0 ? 'Needs attention' : 'All on track',
      icon: AlertTriangle,
      gradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
      borderColor: 'group-hover:border-rose-500/40',
      iconColor: 'text-rose-400 bg-rose-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className={`group relative overflow-hidden rounded-2xl bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 p-5 transition-all duration-300 hover:shadow-xl ${c.borderColor}`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-50 group-hover:opacity-100 transition-opacity`}
            />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  {c.title}
                </p>
                <h4 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  {c.value}
                </h4>
                <p className="text-xs text-zinc-400 mt-1 font-medium">
                  {c.subtitle}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${c.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
