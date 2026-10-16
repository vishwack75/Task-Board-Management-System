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
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Invite by Email
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                placeholder="colleague@example.com"
                {...register('email')}
                className={`w-full pl-10 pr-3 py-2.5 rounded-xl bg-zinc-800/80 border text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  errors.email ? 'border-rose-500' : 'border-zinc-700'
                }`}
              />
            </div>
            <select
              {...register('role')}
              className="px-3 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="viewer">Viewer (Read-only)</option>
              <option value="editor">Editor</option>
            </select>
            <button
              type="submit"
              disabled={isSharing}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-600/30"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite</span>
            </button>
          </div>
          {errors.email && (
            <p className="text-xs text-rose-400">{errors.email.message}</p>
          )}

          {serverMessage && (
            <div
              className={`p-3 rounded-xl text-xs font-medium ${
                serverMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {serverMessage.text}
            </div>
          )}
        </form>

        <div className="border-t border-zinc-800 pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
            People with access
          </h4>

          <div className="space-y-2.5 max-h-56 overflow-y-auto">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-800/40 border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 font-semibold text-xs flex items-center justify-center border border-indigo-500/30">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">
                    {board.owner?.name || 'Owner'}
                  </p>
                  <p className="text-xs text-zinc-500">{board.owner?.email}</p>
                </div>
              </div>
              <RoleBadge role="owner" />
            </div>

            {board.members?.map((member, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 text-zinc-300 font-semibold text-xs flex items-center justify-center">
                    {member.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">
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
                      className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {(!board.members || board.members.length === 0) && (
              <p className="text-xs text-zinc-500 italic py-2 text-center">
                This board hasn't been shared with anyone yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
