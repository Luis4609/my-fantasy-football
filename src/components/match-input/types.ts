import { Player } from '@/types';

export interface PendingResolution {
  excelName: string;
  parsedData: {
    minutes: number;
    rating: number;
    goals: number;
    assists: number;
    yellowCard: boolean;
    redCard: boolean;
    manOfTheMatch: boolean;
  };
  suggestions: { player: Player; similarity: number }[];
  selectedPlayerId: string;
}
