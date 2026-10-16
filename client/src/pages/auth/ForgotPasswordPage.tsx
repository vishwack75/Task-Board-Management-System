import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Kanban, Mail, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { forgotPasswordSchema } from '../../validations/auth.validation';
import type { ForgotPasswordFormValues } from '../../validations/auth.validation';
import { useForgotPasswordMutation } from '../../store/services/apiSlice';
import { useToast } from '../../components/common/Toast';

export const ForgotPasswordPage = () => {
  const toast = useToast();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setErrorMessage(null);
    try {
      const response = await forgotPassword({ email: values.email }).unwrap();
      const message =
        response.message ||
        'If an account with that email exists, a password reset link has been sent.';
      setSubmittedEmail(values.email);
      toast.success(message, 'Reset Link Sent');
    } catch (err: any) {
      const msg =
        err?.data?.message || 'Failed to process password reset. Please try again.';
      setErrorMessage(msg);
      toast.error(msg, 'Error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 w-80 h-80 bg-fuchsia-300/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-400 to-fuchsia-500 text-white shadow-xl shadow-pink-400/30 mb-4">
            <Kanban className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Forgot Password
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            No worries, we'll send you instructions to reset it
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-pink-100 p-8 shadow-2xl shadow-pink-200/30 backdrop-blur-xl">
          {submittedEmail ? (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 border border-emerald-200 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Check your inbox</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                We sent a password reset link to{' '}
                <span className="font-semibold text-slate-700">{submittedEmail}</span>.
                Please check your inbox and spam folder.
              </p>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setSubmittedEmail(null)}
                  className="text-xs font-semibold text-pink-500 hover:text-pink-600 transition-colors"
                >
                  Didn't receive an email? Click here to retry
                </button>

                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-slate-600 bg-pink-50/70 hover:bg-pink-100/70 border border-pink-200/60 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to login</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="flex items-center gap-2.5 p-3.5 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-500 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 disabled:opacity-50 transition-all shadow-lg shadow-pink-400/30 flex items-center justify-center gap-2 group"
                >
                  <span>{isLoading ? 'Sending reset link...' : 'Send reset link'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-pink-100 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-pink-500 hover:text-pink-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to login</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
