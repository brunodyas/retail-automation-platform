import { describe, it, expect, vi } from 'vitest';

// Мокаем Supabase server client
const mockSignUp = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockResetPasswordForEmail = vi.fn();
const mockUpdateUser = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      resetPasswordForEmail: (...args: unknown[]) => mockResetPasswordForEmail(...args),
      updateUser: (...args: unknown[]) => mockUpdateUser(...args),
      getUser: () => mockGetUser(),
    },
  }),
}));

describe('Auth API (server actions)', () => {
  it('should call signUp with correct params', async () => {
    mockSignUp.mockResolvedValue({ error: null });

    const { signUp } = await import('@/api/auth');
    const result = await signUp({
      email: 'test@test.com',
      password: 'Password123',
      name: 'Test User',
      role: 'freelancer',
    });

    expect(result.error).toBeNull();
    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@test.com',
        password: 'Password123',
      })
    );
  });

  it('should return mapped error on signIn failure', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    });

    const { signIn } = await import('@/api/auth');
    const result = await signIn({
      email: 'test@test.com',
      password: 'wrongpassword',
    });

    expect(result.error).toBe('Неверный email или пароль');
  });

  it('should call resetPasswordForEmail', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    const { resetPassword } = await import('@/api/auth');
    const result = await resetPassword('test@test.com');

    expect(result.error).toBeNull();
    expect(mockResetPasswordForEmail).toHaveBeenCalled();
  });

  it('should update password', async () => {
    mockUpdateUser.mockResolvedValue({ error: null });

    const { updatePassword } = await import('@/api/auth');
    const result = await updatePassword('NewPassword123');

    expect(result.error).toBeNull();
    expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'NewPassword123' });
  });

  it('should get current user', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'test-id', email: 'test@test.com' } },
    });

    const { getCurrentUser } = await import('@/api/auth');
    const user = await getCurrentUser();

    expect(user).toEqual({ id: 'test-id', email: 'test@test.com' });
  });

  it('should return null when no user', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    });

    const { getCurrentUser } = await import('@/api/auth');
    const user = await getCurrentUser();

    expect(user).toBeNull();
  });
});
