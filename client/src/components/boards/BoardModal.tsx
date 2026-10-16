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

interface BoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardToEdit?: IBoard | null;
  onSuccess?: (boardId: string) => void;
}

const colorPresets = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
];

export const BoardModal = ({
  isOpen,
  onClose,
  boardToEdit,
  onSuccess,
}: BoardModalProps) => {
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
      color: '#6366f1',
    },
  });

  const selectedColor = watch('color');

  useEffect(() => {
    if (boardToEdit) {
      reset({
        title: boardToEdit.title,
        description: boardToEdit.description || '',
        color: boardToEdit.color || '#6366f1',
      });
    } else {
      reset({
        title: '',
        description: '',
        color: '#6366f1',
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
        onClose();
        if (onSuccess) onSuccess(boardToEdit._id);
      } else {
        const res = await createBoard({
          title: values.title,
          description: values.description,
          color: values.color,
        }).unwrap();
        onClose();
        if (onSuccess && res.data?._id) onSuccess(res.data._id);
      }
    } catch {
    }
  };

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
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
            Board Title *
          </label>
          <input
            type="text"
            placeholder="e.g. Website Redesign, Marketing Q3"
            {...register('title')}
            className={`w-full px-4 py-2.5 rounded-xl bg-zinc-800/80 border text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
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
            placeholder="Optional brief description of what this board is for..."
            {...register('description')}
            className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
          />
          {errors.description && (
            <p className="text-xs text-rose-400 mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-2">
            Accent Color
          </label>
          <div className="flex flex-wrap gap-2.5 items-center">
            {colorPresets.map((color) => (
              <button
                type="button"
                key={color}
                onClick={() => setValue('color', color)}
                className={`w-8 h-8 rounded-full transition-transform ${
                  selectedColor === color
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110'
                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
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
              : 'Create Board'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
