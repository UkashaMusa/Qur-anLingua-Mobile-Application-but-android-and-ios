import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserSettings } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

class UserService {
  private static instance: UserService;
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
  };
  private listeners: ((state: AuthState) => void)[] = [];

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async initialize() {
    await this.loadAuthState();
  }

  private async loadAuthState() {
    try {
      const authData = await AsyncStorage.getItem('auth_state');
      if (authData) {
        this.authState = JSON.parse(authData);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    }
  }

  private async saveAuthState() {
    try {
      await AsyncStorage.setItem('auth_state', JSON.stringify(this.authState));
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState));
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }

  async signUp(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already exists
      const existingUsers = await AsyncStorage.getItem('users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      
      if (users.find((u: any) => u.email === email)) {
        return { success: false, error: 'User already exists' };
      }

      const newUser: User = {
        id: Date.now().toString(),
        email,
        name,
        avatar: `https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&fit=crop`,
        joinDate: new Date(),
        settings: {
          theme: 'auto',
          fontSize: 'medium',
          language: 'english',
          notifications: true,
          autoPlay: false,
          reminderTime: '09:00',
        },
      };

      // Save user
      users.push({ ...newUser, password }); // In real app, password would be hashed
      await AsyncStorage.setItem('users', JSON.stringify(users));

      // Set auth state
      this.authState = {
        isAuthenticated: true,
        user: newUser,
        token: `token_${newUser.id}`,
      };

      await this.saveAuthState();
      this.notifyListeners();

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Sign up failed' };
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const existingUsers = await AsyncStorage.getItem('users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }

      const { password: _, ...userWithoutPassword } = user;

      this.authState = {
        isAuthenticated: true,
        user: userWithoutPassword,
        token: `token_${user.id}`,
      };

      await this.saveAuthState();
      this.notifyListeners();

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Sign in failed' };
    }
  }

  async signOut(): Promise<void> {
    this.authState = {
      isAuthenticated: false,
      user: null,
      token: null,
    };

    await AsyncStorage.removeItem('auth_state');
    this.notifyListeners();
  }

  async updateProfile(updates: Partial<Pick<User, 'name' | 'avatar'>>): Promise<{ success: boolean; error?: string }> {
    if (!this.authState.user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const updatedUser = { ...this.authState.user, ...updates };
      
      // Update in storage
      const existingUsers = await AsyncStorage.getItem('users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      const userIndex = users.findIndex((u: any) => u.id === this.authState.user?.id);
      
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        await AsyncStorage.setItem('users', JSON.stringify(users));
      }

      this.authState.user = updatedUser;
      await this.saveAuthState();
      this.notifyListeners();

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Profile update failed' };
    }
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<{ success: boolean; error?: string }> {
    if (!this.authState.user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const updatedUser = {
        ...this.authState.user,
        settings: { ...this.authState.user.settings, ...settings },
      };

      this.authState.user = updatedUser;
      await this.saveAuthState();
      this.notifyListeners();

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Settings update failed' };
    }
  }

  async syncData(): Promise<{ success: boolean; error?: string }> {
    if (!this.authState.isAuthenticated) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Simulate cloud sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would sync bookmarks, progress, etc. to cloud
      console.log('Data synced successfully');
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Sync failed' };
    }
  }

  async deleteAccount(): Promise<{ success: boolean; error?: string }> {
    if (!this.authState.user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Remove user from storage
      const existingUsers = await AsyncStorage.getItem('users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      const filteredUsers = users.filter((u: any) => u.id !== this.authState.user?.id);
      
      await AsyncStorage.setItem('users', JSON.stringify(filteredUsers));
      
      // Clear all user data
      await AsyncStorage.multiRemove([
        'auth_state',
        'bookmarks',
        'highlights',
        'memorization_progress',
        'quiz_results',
        'notification_settings',
      ]);

      this.authState = {
        isAuthenticated: false,
        user: null,
        token: null,
      };

      this.notifyListeners();
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Account deletion failed' };
    }
  }

  getCurrentUser(): User | null {
    return this.authState.user;
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  getToken(): string | null {
    return this.authState.token;
  }
}

export default UserService;