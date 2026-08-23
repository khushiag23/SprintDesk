import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../services/api';
import { clearToasts } from '../hooks/useToast';

describe('Auth Interceptor', () => {
  beforeEach(() => {
    clearToasts();
  });

  it('should refresh token and get user', async () => {
    const mockFetch = vi.fn();
    // First call: refresh token succeeds
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ accessToken: 'new-access', refreshToken: 'new-refresh' }),
      })
    );
    // Second call: get current user succeeds
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 1, username: 'test', email: 'test@test.com',
          firstName: 'Test', lastName: 'User', image: '', gender: 'male',
          accessToken: 'new-access', refreshToken: 'new-refresh',
        }),
      })
    );

    const originalFetch = globalThis.fetch;
    globalThis.fetch = mockFetch;

    const refreshRes = await authService.refreshToken('old-refresh');
    expect(refreshRes.accessToken).toBe('new-access');

    const userRes = await authService.getCurrentUser(refreshRes.accessToken);
    expect(userRes.username).toBe('test');
    expect(mockFetch).toHaveBeenCalledTimes(2);

    globalThis.fetch = originalFetch;
  });

  it('should throw error on invalid credentials', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
    });

    const originalFetch = globalThis.fetch;
    globalThis.fetch = mockFetch;

    await expect(authService.login('bad', 'creds')).rejects.toThrow('Invalid credentials');
    globalThis.fetch = originalFetch;
  });

  it('should return user data on successful login', async () => {
    const mockUser = {
      id: 1, username: 'emilys', email: 'emily@test.com',
      firstName: 'Emily', lastName: 'Johnson', image: '', gender: 'female',
      accessToken: 'abc', refreshToken: 'def',
    };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockUser),
    });

    const originalFetch = globalThis.fetch;
    globalThis.fetch = mockFetch;

    const user = await authService.login('emilys', 'emilyspass');
    expect(user.username).toBe('emilys');
    expect(user.accessToken).toBe('abc');

    globalThis.fetch = originalFetch;
  });

  it('should handle token refresh failure', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    });

    const originalFetch = globalThis.fetch;
    globalThis.fetch = mockFetch;

    await expect(authService.refreshToken('bad-token')).rejects.toThrow('Session expired');
    globalThis.fetch = originalFetch;
  });
});