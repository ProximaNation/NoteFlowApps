import { Mission } from '../lib/missions';

export interface UserProfile {
  xp: number;
  level: number;
  dailyStreak: number;
  lastLogin: string; // ISO date string
  missionProgress: { [missionId: string]: number };
}
