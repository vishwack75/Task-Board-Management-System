import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, Trash2, Mail, Shield } from 'lucide-react';
import { Modal } from '../common/Modal';
import { RoleBadge } from '../common/Badge';
import { shareSchema } from '../../validations/board.validation';
import type { ShareFormValues } from '../../validations/board.validation';
import type { IBoard } from '../../types';
import {
  useShareBoardMutation,
  useRemoveBoardMemberMutation,
} from '../../store/services/apiSlice';

interface ShareBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: IBoard | null;
}

export const ShareBoardModal = ({
  isOpen,
  onClose,
  board,
}: ShareBoardModalProps) => {
  const [shareBoard, { isLoading: isSharing }] = useShareBoardMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveBoardMemberMutation();
  const [serverMessage, setServerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShareFormValues>({
    resolver: zodResolver(shareSchema),
    defaultValues: {
      email: '',
      role: 'viewer',
    },
  });

  const onSubmit = async (values: ShareFormValues) => {
    if (!board) return;
    setServerMessage(null);
    try {
      const res = await shareBoard({
        id: board._id,
        email: values.email,
        role: values.role,
      }).unwrap();
      reset();
      setServerMessage({
        type: 'success',
        text: res.message || `Shared with ${values.email}`,
      });
    } catch (err: any) {
      setServerMessage({
        type: 'error',
        text: err?.data?.message || 'Failed to share board',
      });
    }
  };

  const handleRemove = async (email: string) => {
    if (!board) return;
    try {
      await removeMember({ id: board._id, email }).unwrap();
    } catch {
    }
  };

  if (!board) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Share "${board.title}"`}
      description="Invite team members to view or collaborate on this board."
      maxWidth="max-w-md"
    >
      <div className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Invite by Email
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-pink-300" />
              <input
                type="email"
                placeholder="colleague@example.com"
                {...register('email')}
                className={`w-full pl-10 pr-3 py-2.5 rounded-xl bg-pink-50/60 border text-slate-700 placeholder-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300/50 ${
                  errors.email ? 'border-rose-400' : 'border-pink-200'
                }`}
              />
            </div>
            <select
              {...register('role')}
              className="px-3 py-2.5 rounded-xl bg-pink-50/60 border border-pink-200 text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300/50"
            >
              <option value="viewer">Viewer (Read-only)</option>
              <option value="editor">Editor</option>
            </select>
            <button
              type="submit"
              disabled={isSharing}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-medium text-sm flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-lg shadow-pink-400/25"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite</span>
            </button>
          </div>
          {errors.email && (
            <p className="text-xs text-rose-500">{errors.email.message}</p>
          )}

          {serverMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-medium ${
                serverMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-rose-50 text-rose-500 border border-rose-200'
              }`}
            >
              {serverMessage.text}
            </div>
          )}
        </form>

        <div className="border-t border-pink-100 pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            People with access
          </h4>

          <div className="space-y-2.5 max-h-56 overflow-y-auto">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-pink-50/50 border border-pink-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-500 font-semibold text-xs flex items-center justify-center border border-pink-200">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {board.owner?.name || 'Owner'}
                  </p>
                  <p className="text-xs text-slate-400">{board.owner?.email}</p>
                </div>
              </div>
              <RoleBadge role="owner" />
            </div>

            {board.members?.map((member, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-pink-100 hover:border-pink-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-500 font-semibold text-xs flex items-center justify-center border border-pink-200">
                    {member.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {member.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RoleBadge role={member.role} />
                  {board.isOwner && (
                    <button
                      onClick={() => handleRemove(member.email)}
                      disabled={isRemoving}
                      className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {(!board.members || board.members.length === 0) && (
              <p className="text-xs text-slate-400 italic py-2 text-center">
                This board hasn't been shared with anyone yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
