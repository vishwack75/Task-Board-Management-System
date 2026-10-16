import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
type AuthState = { auth: { token: string | null } };
import type {
  ApiResponse,
  IBoard,
  IDashboardSummary,
  ITask,
  IUser,
} from '../../types';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as AuthState).auth.token || localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Auth', 'User', 'Board', 'Task', 'Dashboard'],
  endpoints: (builder) => ({
    login: builder.mutation<
      ApiResponse<{ user: IUser; token: string }>,
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth', 'User', 'Board', 'Task', 'Dashboard'],
    }),

    signup: builder.mutation<
      ApiResponse<{ user: IUser; token: string }>,
      { name: string; email: string; password: string }
    >({
      query: (userData) => ({
        url: '/auth/signup',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth', 'User', 'Board', 'Task', 'Dashboard'],
    }),

    logoutApi: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'User', 'Board', 'Task', 'Dashboard'],
    }),

    forgotPassword: builder.mutation<ApiResponse<null>, { email: string }>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    resetPassword: builder.mutation<
      ApiResponse<null>,
      { token: string; password: string }
    >({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),

    getMe: builder.query<ApiResponse<IUser>, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),

    getProfile: builder.query<ApiResponse<IUser>, void>({
      query: () => '/user/profile',
      providesTags: ['User'],
    }),

    updateProfile: builder.mutation<ApiResponse<IUser>, { name: string }>({
      query: (body) => ({
        url: '/user/profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    uploadAvatar: builder.mutation<ApiResponse<{ avatar: string; user: IUser }>, FormData>({
      query: (formData) => ({
        url: '/user/avatar',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),

    changePassword: builder.mutation<
      ApiResponse<null>,
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({
        url: '/user/change-password',
        method: 'PUT',
        body,
      }),
    }),

    getBoards: builder.query<ApiResponse<IBoard[]>, void>({
      query: () => '/boards',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Board' as const, id: _id })),
              { type: 'Board', id: 'LIST' },
            ]
          : [{ type: 'Board', id: 'LIST' }],
    }),

    getBoardById: builder.query<ApiResponse<IBoard>, string>({
      query: (id) => `/boards/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Board', id }],
    }),

    createBoard: builder.mutation<
      ApiResponse<IBoard>,
      { title: string; description?: string; color?: string }
    >({
      query: (body) => ({
        url: '/boards',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Board', id: 'LIST' }, 'Dashboard'],
    }),

    updateBoard: builder.mutation<
      ApiResponse<IBoard>,
      { id: string; title?: string; description?: string; color?: string; columns?: any[] }
    >({
      query: ({ id, ...body }) => ({
        url: `/boards/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Board', id },
        { type: 'Board', id: 'LIST' },
      ],
    }),

    deleteBoard: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/boards/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Board', id: 'LIST' },
        'Task',
        'Dashboard',
      ],
    }),

    shareBoard: builder.mutation<
      ApiResponse<IBoard>,
      { id: string; email: string; role?: 'viewer' | 'editor' }
    >({
      query: ({ id, ...body }) => ({
        url: `/boards/${id}/share`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Board', id }],
    }),

    removeBoardMember: builder.mutation<
      ApiResponse<IBoard>,
      { id: string; email: string }
    >({
      query: ({ id, email }) => ({
        url: `/boards/${id}/members/${encodeURIComponent(email)}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Board', id }],
    }),

    getTasks: builder.query<
      ApiResponse<ITask[]>,
      {
        boardId: string;
        search?: string;
        priority?: string;
        columnId?: string;
        dueDate?: string;
        isCompleted?: boolean;
      }
    >({
      query: ({ boardId, search, priority, columnId, dueDate, isCompleted }) => {
        const params = new URLSearchParams();
        params.append('boardId', boardId);
        if (search) params.append('search', search);
        if (priority) params.append('priority', priority);
        if (columnId) params.append('columnId', columnId);
        if (dueDate) params.append('dueDate', dueDate);
        if (isCompleted !== undefined) params.append('isCompleted', String(isCompleted));
        return `/tasks?${params.toString()}`;
      },
      providesTags: (result, _error, { boardId }) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Task' as const, id: _id })),
              { type: 'Task', id: `BOARD_${boardId}` },
            ]
          : [{ type: 'Task', id: `BOARD_${boardId}` }],
    }),

    createTask: builder.mutation<
      ApiResponse<ITask>,
      {
        title: string;
        description?: string;
        boardId: string;
        columnId?: string;
        priority?: string;
        dueDate?: string | null;
        assignedTo?: string | null;
      }
    >({
      query: (body) => ({
        url: '/tasks',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: 'Task', id: `BOARD_${boardId}` },
        'Dashboard',
      ],
    }),

    updateTask: builder.mutation<
      ApiResponse<ITask>,
      {
        id: string;
        title?: string;
        description?: string;
        boardId?: string;
        columnId?: string;
        priority?: string;
        dueDate?: string | null;
        order?: number;
        isCompleted?: boolean;
        assignedTo?: string | null;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result) => [
        { type: 'Task', id: result?.data?._id },
        { type: 'Task', id: `BOARD_${result?.data?.boardId}` },
        'Dashboard',
      ],
    }),

    deleteTask: builder.mutation<ApiResponse<null>, { id: string; boardId: string }>({
      query: ({ id }) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: 'Task', id: `BOARD_${boardId}` },
        'Dashboard',
      ],
    }),

    reorderTasks: builder.mutation<
      ApiResponse<null>,
      {
        boardId: string;
        items: Array<{
          taskId: string;
          boardId?: string;
          columnId: string;
          order: number;
        }>;
      }
    >({
      query: (body) => ({
        url: '/tasks/reorder',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: 'Task', id: `BOARD_${boardId}` },
        'Dashboard',
      ],
    }),

    getDashboardSummary: builder.query<ApiResponse<IDashboardSummary>, void>({
      query: () => '/dashboard/summary',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useLogoutApiMutation,
  useGetMeQuery,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useChangePasswordMutation,
  useGetBoardsQuery,
  useGetBoardByIdQuery,
  useCreateBoardMutation,
  useUpdateBoardMutation,
  useDeleteBoardMutation,
  useShareBoardMutation,
  useRemoveBoardMemberMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useReorderTasksMutation,
  useGetDashboardSummaryQuery,
} = apiSlice;
