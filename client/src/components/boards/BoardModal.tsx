import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../common/Modal';
import { boardSchema } from '../../validations/board.validation';
import type { BoardFormValues } from '../../validations/board.validation';
import type { IBoard } from '../../types';
import {
  useCreateBoardMutation,
  useUpdateBoardMutation,
} from '../../store/services/apiSlice';
import { useToast } from '../common/Toast';

interface BoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardToEdit?: IBoard | null;
  onSuccess?: (boardId: string) => void;
}

const colorPresets = [
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
  '#8b5cf6', // violet-500
  '#6366f1', // indigo-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#10b981', // emerald-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
];

export const BoardModal = ({
  isOpen,
  onClose,
  boardToEdit,
  onSuccess,
}: BoardModalProps) => {
  const toast = useToast();
  const [createBoard, { isLoading: isCreating }] = useCreateBoardMutation();
  const [updateBoard, { isLoading: isUpdating }] = useUpdateBoardMutation();

  const isEditMode = Boolean(boardToEdit);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BoardFormValues>({
    resolver: zodResolver(boardSchema),
    defaultValues: {
      title: '',
      description: '',
      color: '#ec4899',
    },
  });

  const selectedColor = watch('color');

  useEffect(() => {
    if (boardToEdit) {
      reset({
        title: boardToEdit.title,
        description: boardToEdit.description || '',
        color: boardToEdit.color || '#ec4899',
      });
    } else {
      reset({
        title: '',
        description: '',
        color: '#ec4899',
      });
    }
  }, [boardToEdit, isOpen, reset]);

  const onSubmit = async (values: BoardFormValues) => {
    try {
      if (isEditMode && boardToEdit) {
        await updateBoard({
          id: boardToEdit._id,
          title: values.title,
          description: values.description,
          color: values.color,
        }).unwrap();
        toast.success(`Board "${values.title}" updated successfully!`, 'Board Updated');
        onClose();
        if (onSuccess) onSuccess(boardToEdit._id);
      } else {
        const res = await createBoard({
          title: values.title,
          description: values.description,
          color: values.color,
        }).unwrap();
        toast.success(`Board "${values.title}" created successfully!`, 'Board Created');
        onClose();
        if (onSuccess && res.data?._id) onSuccess(res.data._id);
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || 'Failed to save board. Please try again.',
        'Error'
      );
    }
  };

  const inputBase =
    'w-full px-4 py-2.5 rounded-xl bg-pink-50/60 border text-slate-700 placeholder-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300/50 transition-all';
  const labelBase = 'block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Board' : 'Create New Board'}
      description={
        isEditMode
          ? 'Update the details and color scheme for this task board.'
          : 'Create a new board to organize and track tasks.'
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className={labelBase}>Board Title *</label>
          <input
            type="text"
            placeholder="e.g. Website Redesign, Marketing Q3"
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
            placeholder="Optional brief description of what this board is for..."
            {...register('description')}
            className={`${inputBase} border-pink-200 resize-none`}
          />
          {errors.description && (
            <p className="text-xs text-rose-500 mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label className={labelBase}>Accent Color</label>
          <div className="flex flex-wrap gap-2.5 items-center">
            {colorPresets.map((color) => (
              <button
                type="button"
                key={color}
                onClick={() => setValue('color', color)}
                className={`w-8 h-8 rounded-full transition-transform ${
                  selectedColor === color
                    ? 'ring-2 ring-pink-400 ring-offset-2 ring-offset-white scale-110'
                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-pink-100">
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
              : 'Create Board'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
