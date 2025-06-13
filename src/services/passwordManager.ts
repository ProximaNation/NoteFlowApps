import { createHash } from 'crypto';

const SESSION_KEY = 'noteflow_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export class PasswordManager {
  private static instance: PasswordManager;
  private sessionExpiry: number | null = null;

  private constructor() {
    // Load session expiry from localStorage
    const savedExpiry = localStorage.getItem(SESSION_KEY);
    if (savedExpiry) {
      this.sessionExpiry = parseInt(savedExpiry, 10);
      // Check if session is still valid
      if (Date.now() > this.sessionExpiry) {
        this.clearSession();
      }
    }
  }

  public static getInstance(): PasswordManager {
    if (!PasswordManager.instance) {
      PasswordManager.instance = new PasswordManager();
    }
    return PasswordManager.instance;
  }

  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  public async setPassword(password: string): Promise<void> {
    const hashedPassword = this.hashPassword(password);
    localStorage.setItem('noteflow_password', hashedPassword);
    this.startSession();
  }

  public async verifyPassword(password: string): Promise<boolean> {
    const hashedPassword = this.hashPassword(password);
    const storedPassword = localStorage.getItem('noteflow_password');
    if (hashedPassword === storedPassword) {
      this.startSession();
      return true;
    }
    return false;
  }

  public async hasPassword(): Promise<boolean> {
    return !!localStorage.getItem('noteflow_password');
  }

  private startSession(): void {
    this.sessionExpiry = Date.now() + SESSION_DURATION;
    localStorage.setItem(SESSION_KEY, this.sessionExpiry.toString());
  }

  private clearSession(): void {
    this.sessionExpiry = null;
    localStorage.removeItem(SESSION_KEY);
  }

  public isSessionValid(): boolean {
    if (!this.sessionExpiry) return false;
    return Date.now() < this.sessionExpiry;
  }

  public async checkAccess(): Promise<boolean> {
    if (!await this.hasPassword()) return true;
    return this.isSessionValid();
  }
} 