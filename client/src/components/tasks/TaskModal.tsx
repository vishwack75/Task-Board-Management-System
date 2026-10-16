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

  const inputBase =
    'w-full px-4 py-2.5 rounded-xl bg-pink-50/60 border text-slate-700 placeholder-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300/50 transition-all';
  const selectBase =
    'w-full px-3 py-2.5 rounded-xl bg-pink-50/60 border border-pink-200 text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300/50';
  const labelBase = 'block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5';

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
          <label className={labelBase}>Task Title *</label>
          <input
            type="text"
            placeholder="e.g. Design navigation bar"
            {...register('title')}
            className={`${inputBase} ${errors.title ? 'border-rose-400' : 'border-pink-200'}`}
          />
          {errors.title && (
            <p className="text-xs text-rose-500 mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className={labelBase}>Description</label>
          <textarea
            rows={3}
            placeholder="Add relevant notes, links, or checklist items..."
            {...register('description')}
            className={`${inputBase} border-pink-200 resize-none`}
          />
          {errors.description && (
            <p className="text-xs text-rose-500 mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelBase}>Column</label>
            <select {...register('columnId')} className={selectBase}>
              {columns.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelBase}>Priority</label>
            <select {...register('priority')} className={selectBase}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className={labelBase}>Due Date</label>
            <input
              type="date"
              {...register('dueDate')}
              className={selectBase}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-pink-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 disabled:opacity-50 rounded-xl shadow-lg shadow-pink-400/25 transition-all"
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
