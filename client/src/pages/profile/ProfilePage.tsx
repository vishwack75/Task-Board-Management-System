import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Camera, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import {
  profileSchema,
  passwordSchema,
} from '../../validations/user.validation';
import type {
  ProfileFormValues,
  PasswordFormValues,
} from '../../validations/user.validation';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useChangePasswordMutation,
} from '../../store/services/apiSlice';
import { useAppDispatch } from '../../store/store';
import { updateUser } from '../../store/slices/authSlice';

export const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { data: profileData, isLoading: isProfileLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);

  const currentUser = profileData?.data;

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: currentUser?.name || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onProfileSubmit = async (values: ProfileFormValues) => {
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);
    try {
      const res = await updateProfile({ name: values.name }).unwrap();
      if (res.data) {
        dispatch(updateUser(res.data));
        setProfileSuccessMsg('Name updated successfully!');
      }
    } catch (err: any) {
      setProfileErrorMsg(err?.data?.message || 'Failed to update profile');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await uploadAvatar(formData).unwrap();
      if (res.data?.user) {
        dispatch(updateUser(res.data.user));
        setProfileSuccessMsg('Avatar updated successfully!');
      }
    } catch (err: any) {
      setProfileErrorMsg(err?.data?.message || 'Failed to upload avatar image');
    }
  };

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setPasswordSuccessMsg(null);
    setPasswordErrorMsg(null);
    try {
      const res = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      resetPasswordForm();
      setPasswordSuccessMsg(res.message || 'Password changed successfully!');
    } catch (err: any) {
      setPasswordErrorMsg(err?.data?.message || 'Failed to change password');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const inputBase =
    'w-full px-4 py-2.5 rounded-xl bg-pink-50/60 border text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300/50 transition-all';
  const labelBase = 'block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 text-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Account Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your personal details, profile picture, and security.
          </p>
        </div>

        {isProfileLoading ? (
          <div className="space-y-6">
            <div className="h-64 rounded-3xl bg-pink-50 animate-pulse border border-pink-100" />
            <div className="h-64 rounded-3xl bg-pink-50 animate-pulse border border-pink-100" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profile Information Card */}
            <div className="rounded-3xl bg-white border border-pink-100 p-6 sm:p-8 shadow-sm shadow-pink-100/50">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-pink-400" />
                Profile Information
              </h2>

              {profileSuccessMsg && (
                <div className="flex items-center gap-2.5 p-3.5 mb-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {profileErrorMsg && (
                <div className="flex items-center gap-2.5 p-3.5 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-500 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileErrorMsg}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-pink-100">
                <div className="relative group">
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-24 h-24 rounded-full object-cover border-2 border-pink-300 shadow-xl shadow-pink-200/30"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-pink-400 via-rose-400 to-fuchsia-500 text-white font-bold text-2xl flex items-center justify-center shadow-xl shadow-pink-300/30">
                      {getInitials(currentUser?.name)}
                    </div>
                  )}

                  <label className="absolute bottom-0 right-0 p-2 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white shadow-lg cursor-pointer transition-transform group-hover:scale-110">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      disabled={isUploadingAvatar}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-bold text-slate-800">{currentUser?.name}</h3>
                  <p className="text-sm text-pink-400">{currentUser?.email}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Click the camera icon to upload a custom profile picture (PNG, JPG, WebP max 5MB).
                  </p>
                  {isUploadingAvatar && (
                    <p className="text-xs text-pink-500 font-semibold mt-1">
                      Uploading image...
                    </p>
                  )}
                </div>
              </div>

              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4 max-w-md">
                <div>
                  <label className={labelBase}>Display Name</label>
                  <input
                    type="text"
                    {...registerProfile('name')}
                    className={`${inputBase} ${profileErrors.name ? 'border-rose-400' : 'border-pink-200'}`}
                  />
                  {profileErrors.name && (
                    <p className="text-xs text-rose-500 mt-1">{profileErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    value={currentUser?.email || ''}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-sm cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-semibold text-sm disabled:opacity-50 transition-all shadow-lg shadow-pink-400/25"
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>

            {/* Change Password Card */}
            <div className="rounded-3xl bg-white border border-pink-100 p-6 sm:p-8 shadow-sm shadow-pink-100/50">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-pink-400" />
                Change Password
              </h2>

              {passwordSuccessMsg && (
                <div className="flex items-center gap-2.5 p-3.5 mb-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{passwordSuccessMsg}</span>
                </div>
              )}

              {passwordErrorMsg && (
                <div className="flex items-center gap-2.5 p-3.5 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-500 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                <div>
                  <label className={labelBase}>Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword('currentPassword')}
                    className={`${inputBase} ${passwordErrors.currentPassword ? 'border-rose-400' : 'border-pink-200'}`}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-xs text-rose-500 mt-1">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelBase}>New Password</label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    {...registerPassword('newPassword')}
                    className={`${inputBase} ${passwordErrors.newPassword ? 'border-rose-400' : 'border-pink-200'}`}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-xs text-rose-500 mt-1">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelBase}>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Re-enter your new password"
                    {...registerPassword('confirmNewPassword')}
                    className={`${inputBase} ${passwordErrors.confirmNewPassword ? 'border-rose-400' : 'border-pink-200'}`}
                  />
                  {passwordErrors.confirmNewPassword && (
                    <p className="text-xs text-rose-500 mt-1">
                      {passwordErrors.confirmNewPassword.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-semibold text-sm disabled:opacity-50 transition-all shadow-lg shadow-pink-400/25"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
