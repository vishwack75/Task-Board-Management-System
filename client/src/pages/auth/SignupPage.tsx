import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Kanban, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { signupSchema } from '../../validations/auth.validation';
import type { SignupFormValues } from '../../validations/auth.validation';
import { useSignupMutation } from '../../store/services/apiSlice';
import { useAppDispatch } from '../../store/store';
import { setCredentials } from '../../store/slices/authSlice';

export const SignupPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [signup, { isLoading }] = useSignupMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    setErrorMessage(null);
    try {
      const response = await signup({
        name: values.name,
        email: values.email,
        password: values.password,
      }).unwrap();

      if (response.success && response.data) {
        dispatch(
          setCredentials({
            user: response.data.user,
            token: response.data.token,
          })
        );
        navigate('/');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.data?.message || 'Registration failed. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/2 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 w-80 h-80 bg-fuchsia-300/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-400 to-fuchsia-500 text-white shadow-xl shadow-pink-400/30 mb-4">
            <Kanban className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Start managing your projects and boards effortlessly
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-pink-100 p-8 shadow-2xl shadow-pink-200/30 backdrop-blur-xl">
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3.5 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-500 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-pink-300" />
                <input
                  type="text"
                  placeholder="Alex Morgan"
                  {...register('name')}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-pink-50/60 border text-slate-700 placeholder-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300/60 transition-all ${
                    errors.name ? 'border-rose-400' : 'border-pink-200'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-pink-300" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register('email')}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-pink-50/60 border text-slate-700 placeholder-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300/60 transition-all ${
                    errors.email ? 'border-rose-400' : 'border-pink-200'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-pink-300" />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  {...register('password')}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-pink-50/60 border text-slate-700 placeholder-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300/60 transition-all ${
                    errors.password ? 'border-rose-400' : 'border-pink-200'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-pink-300" />
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  {...register('confirmPassword')}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-pink-50/60 border text-slate-700 placeholder-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300/60 transition-all ${
                    errors.confirmPassword ? 'border-rose-400' : 'border-pink-200'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 disabled:opacity-50 transition-all shadow-lg shadow-pink-400/30 flex items-center justify-center gap-2 group"
            >
              <span>{isLoading ? 'Creating account...' : 'Create account'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-pink-100 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-pink-500 hover:text-pink-600 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
