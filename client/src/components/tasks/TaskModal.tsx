import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../common/Modal';
import { taskSchema } from '../../validations/task.validation';
import type { TaskFormValues } from '../../validations/task.validation';
import type { ITask, IBoardColumn } from '../../types';
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from '../../store/services/apiSlice';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  columns: IBoardColumn[];
  defaultColumnId?: string;
  taskToEdit?: ITask | null;
}

export const TaskModal = ({
  isOpen,
  onClose,
  boardId,
  columns,
  defaultColumnId = 'todo',
  taskToEdit,
}: TaskModalProps) => {
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  const isEditMode = Boolean(taskToEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      columnId: defaultColumnId,
      priority: 'medium',
      dueDate: '',
    },
  });

  useEffect(() => {
    if (taskToEdit) {
      const formattedDate = taskToEdit.dueDate
        ? new Date(taskToEdit.dueDate).toISOString().split('T')[0]
        : '';
      reset({
        title: taskToEdit.title,
        description: taskToEdit.description || '',
        columnId: taskToEdit.columnId,
        priority: taskToEdit.priority,
        dueDate: formattedDate,
      });
    } else {
      reset({
        title: '',
        description: '',
        columnId: defaultColumnId,
        priority: 'medium',
        dueDate: '',
      });
    }
  }, [taskToEdit, defaultColumnId, isOpen, reset]);

  const onSubmit = async (values: TaskFormValues) => {
    try {
      const formattedDueDate = values.dueDate
        ? new Date(values.dueDate).toISOString()
        : null;

      if (isEditMode && taskToEdit) {
        await updateTask({
          id: taskToEdit._id,
          title: values.title,
          description: values.description,
          columnId: values.columnId,
          priority: values.priority,
          dueDate: formattedDueDate,
        }).unwrap();
      } else {
        await createTask({
          title: values.title,
          description: values.description,
          boardId,
          columnId: values.columnId,
          priority: values.priority,
          dueDate: formattedDueDate,
        }).unwrap();
      }
      onClose();
    } catch {
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Task' : 'Create New Task'}
      description={
        isEditMode
          ? 'Modify task details, priority, or status.'
          : 'Add a new task card to your board.'
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
            Task Title *
          </label>
          <input
            type="text"
            placeholder="e.g. Design navigation bar"
            {...register('title')}
            className={`w-full px-4 py-2.5 rounded-xl bg-zinc-800/80 border text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
              errors.title ? 'border-rose-500' : 'border-zinc-700'
            }`}
          />
          {errors.title && (
            <p className="text-xs text-rose-400 mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Add relevant notes, links, or checklist items..."
            {...register('description')}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
          />
          {errors.description && (
            <p className="text-xs text-rose-400 mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Column
            </label>
            <select
              {...register('columnId')}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Priority
            </label>
            <select
              {...register('priority')}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Due Date
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
          >
            {isCreating || isUpdating
              ? 'Saving...'
              : isEditMode
              ? 'Save Changes'
              : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
