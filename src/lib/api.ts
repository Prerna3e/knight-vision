const BASE_URL = 'http://localhost:3001/api';

export interface User {
  id: string;
  username: string;
  email: string;
  elo: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface GameRecord {
  id: string;
  whiteId: string;
  blackId: string;
  status: string;
  winnerId: string | null;
  createdAt: string;
  white?: User;
  black?: User;
}

export const api = {
  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(error.message || 'Registration failed');
    }
    return res.json();
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Login failed');
    }
    return res.json();
  },

  async getMyGames(token: string): Promise<GameRecord[]> {
    const res = await fetch(`${BASE_URL}/games/my`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error('Failed to fetch games');
    }
    return res.json();
  },

  async getLeaderboard(): Promise<User[]> {
    const res = await fetch(`${BASE_URL}/leaderboard`);
    if (!res.ok) {
      throw new Error('Failed to fetch leaderboard');
    }
    return res.json();
  }
};
