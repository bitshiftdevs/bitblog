import { defineStore } from 'pinia';
import type { AuthUser, LoginRequest, RegisterRequest } from '../../lib/types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    refreshToken: null,
    isLoading: false,
  }),

  getters: {
    isAuthenticated: (state): boolean => {
      return !!(state.user && state.token);
    },

    canAccessAdmin: (state): boolean => {
      if (!state.user) return false;

      // Check if user has admin-level permissions
      const adminPermissions = [
        'admin',
        'manage_users',
        'manage_posts',
        'manage_settings',
      ];
      return adminPermissions.some((permission) =>
        state.user?.permissions?.includes(permission),
      );
    },

    hasPermission: (state) => {
      return (permission: string): boolean => {
        return state.user?.permissions?.includes(permission) || false;
      };
    },

    hasAnyPermission: (state) => {
      return (permissions: string[]): boolean => {
        if (!state.user?.permissions) return false;
        return permissions.some((permission) =>
          state.user?.permissions?.includes(permission),
        );
      };
    },
  },

  actions: {
    async initialize() {
      // Check for stored auth data on app initialization
      const token = localStorage.getItem('auth.token');
      const refreshToken = localStorage.getItem('auth.refreshToken');

      if (token) {
        this.token = token;
        this.refreshToken = refreshToken;

        try {
          await this.fetchUser();
        } catch (error) {
          // Token might be expired, try to refresh
          if (refreshToken) {
            try {
              await this.refreshAuthToken();
            } catch (refreshError) {
              this.logout();
            }
          } else {
            this.logout();
          }
        }
      }
    },

    async login(credentials: LoginRequest) {
      this.isLoading = true;

      try {
        const { data } = await $fetch<{ data: any }>('/api/auth/login', {
          method: 'POST',
          body: credentials,
        });

        this.user = data.user;
        this.token = data.token;
        this.refreshToken = data.refreshToken;

        // Store in localStorage
        // if (app._id) {
        localStorage.setItem('auth.token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('auth.refreshToken', data.refreshToken);
        }
        // }

        return data;
      } catch (error) {
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async register(userData: RegisterRequest) {
      this.isLoading = true;

      try {
        const { data } = await $fetch<{ data: any }>('/api/auth/register', {
          method: 'POST',
          body: userData,
        });

        this.user = data.user;
        this.token = data.token;
        this.refreshToken = data.refreshToken;

        // Store in localStorage
        // if (app._id) {
        localStorage.setItem('auth.token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('auth.refreshToken', data.refreshToken);
        }
        // }

        return data;
      } catch (error) {
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      try {
        // Call logout endpoint to invalidate server-side session
        if (this.token) {
          await $fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          });
        }
      } catch (error) {
        // Continue with logout even if server request fails
        console.error('Logout request failed:', error);
      } finally {
        // Clear local state
        this.user = null;
        this.token = null;
        this.refreshToken = null;

        // Clear localStorage
        // if (app._id) {
        localStorage.removeItem('auth.token');
        localStorage.removeItem('auth.refreshToken');
        // }
      }
    },

    async fetchUser() {
      if (!this.token) {
        throw new Error('No authentication token');
      }

      try {
        const { data } = await $fetch<{ data: AuthUser }>('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        this.user = data;
        return data;
      } catch (error) {
        throw error;
      }
    },

    async refreshAuthToken() {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      try {
        const { data } = await $fetch<{ data: any }>('/api/auth/refresh', {
          method: 'POST',
          body: {
            refreshToken: this.refreshToken,
          },
        });

        this.token = data.token;
        this.user = data.user;

        // Update localStorage
        // if (app._id) {
        localStorage.setItem('auth.token', data.token);
        // }

        return data;
      } catch (error) {
        // Refresh failed, logout user
        this.logout();
        throw error;
      }
    },

    async updateProfile(profileData: Partial<AuthUser>) {
      if (!this.token) {
        throw new Error('Not authenticated');
      }

      try {
        const { data } = await $fetch<{ data: AuthUser }>('/api/auth/profile', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          body: profileData,
        });

        this.user = data;
        return data;
      } catch (error) {
        throw error;
      }
    },

    async changePassword(passwordData: {
      currentPassword: string;
      newPassword: string;
    }) {
      if (!this.token) {
        throw new Error('Not authenticated');
      }

      try {
        await $fetch('/api/auth/change-password', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          body: passwordData,
        });
      } catch (error) {
        throw error;
      }
    },

    async forgotPassword(email: string) {
      try {
        await $fetch('/api/auth/forgot-password', {
          method: 'POST',
          body: { email },
        });
      } catch (error) {
        throw error;
      }
    },

    async resetPassword(data: { token: string; password: string }) {
      try {
        await $fetch('/api/auth/reset-password', {
          method: 'POST',
          body: data,
        });
      } catch (error) {
        throw error;
      }
    },

    async setupTwoFactor() {
      if (!this.token) {
        throw new Error('Not authenticated');
      }

      try {
        const { data } = await $fetch<{
          data: { secret: string; qrCode: string };
        }>('/api/auth/2fa/setup', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });

        return data;
      } catch (error) {
        throw error;
      }
    },

    async enableTwoFactor(code: string) {
      if (!this.token) {
        throw new Error('Not authenticated');
      }

      try {
        await $fetch('/api/auth/2fa/enable', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          body: { code },
        });

        // Update user state
        if (this.user) {
          this.user.twoFactorEnabled = true;
        }
      } catch (error) {
        throw error;
      }
    },

    async disableTwoFactor(code: string) {
      if (!this.token) {
        throw new Error('Not authenticated');
      }

      try {
        await $fetch('/api/auth/2fa/disable', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          body: { code },
        });

        // Update user state
        if (this.user) {
          this.user.twoFactorEnabled = false;
        }
      } catch (error) {
        throw error;
      }
    },
  },
});
