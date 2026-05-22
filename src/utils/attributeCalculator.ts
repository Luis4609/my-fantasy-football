import { Player, Position } from '../types';

export interface AttributeData {
  subject: string;
  value: number;
  fullMark: number;
}

export interface CalculatedAttributes {
  ovr: number;
  attributes: AttributeData[];
}

/**
 * Derives FUT FIFA-style attributes and overall rating (OVR) for a player 
 * based on their statistics and positions.
 */
export function calculatePlayerAttributes(player: Player): CalculatedAttributes {
  const { position, goals, assists, cleanSheets, matchesPlayed, averageRating } = player;
  const matches = Math.max(1, matchesPlayed);

  // OVR is roughly averageRating * 10, capped at 99 and minimum 50
  const ovr = Math.min(99, Math.max(50, Math.round(averageRating * 10)));

  if (position === Position.GK) {
    // GK Attributes: Diving, Handling, Kicking, Reflexes, Speed, Positioning
    const diving = Math.min(99, Math.max(30, Math.round(60 + (averageRating - 6) * 18 + cleanSheets * 2)));
    const handling = Math.min(99, Math.max(30, Math.round(62 + (cleanSheets / matches) * 35)));
    const kicking = Math.min(99, Math.max(30, Math.round(55 + (assists / matches) * 40)));
    const reflexes = Math.min(99, Math.max(30, Math.round(65 + (averageRating - 6) * 22)));
    const speed = Math.min(99, Math.max(30, Math.round(50 + (averageRating - 6) * 12)));
    const positioning = Math.min(99, Math.max(30, Math.round(60 + (cleanSheets / matches) * 40)));

    return {
      ovr,
      attributes: [
        { subject: 'Diving', value: diving, fullMark: 99 },
        { subject: 'Handling', value: handling, fullMark: 99 },
        { subject: 'Kicking', value: kicking, fullMark: 99 },
        { subject: 'Reflexes', value: reflexes, fullMark: 99 },
        { subject: 'Speed', value: speed, fullMark: 99 },
        { subject: 'Positioning', value: positioning, fullMark: 99 },
      ]
    };
  } else {
    // Outfielder Attributes: Pace, Shooting, Passing, Dribbling, Defending, Physicality
    let basePace = 75;
    let baseShooting = 50;
    let basePassing = 55;
    let baseDribbling = 60;
    let baseDefending = 45;
    let basePhysicality = 55;

    if (position === Position.DEF) {
      basePace = 70;
      baseShooting = 40;
      basePassing = 55;
      baseDribbling = 55;
      baseDefending = 75;
      basePhysicality = 70;
    } else if (position === Position.MID) {
      basePace = 75;
      baseShooting = 60;
      basePassing = 75;
      baseDribbling = 72;
      baseDefending = 55;
      basePhysicality = 65;
    } else if (position === Position.FWD) {
      basePace = 85;
      baseShooting = 78;
      basePassing = 60;
      baseDribbling = 75;
      baseDefending = 30;
      basePhysicality = 62;
    } else if (position === Position.COACH) {
      // Coach attributes
      basePace = 50;
      baseShooting = 50;
      basePassing = 80;
      baseDribbling = 60;
      baseDefending = 50;
      basePhysicality = 50;
    }

    const pace = Math.min(99, Math.max(30, Math.round(basePace + (goals * 1.5 + assists) / matches * 6 + (averageRating - 6) * 5)));
    const shooting = Math.min(99, Math.max(30, Math.round(baseShooting + (goals / matches) * 45 + (averageRating - 6) * 6)));
    const passing = Math.min(99, Math.max(30, Math.round(basePassing + (assists / matches) * 45 + (averageRating - 6) * 8)));
    const dribbling = Math.min(99, Math.max(30, Math.round(baseDribbling + (averageRating - 6) * 12 + (assists / matches) * 10)));
    const defending = Math.min(99, Math.max(30, Math.round(baseDefending + (cleanSheets / matches) * 35 + (averageRating - 6) * 4)));
    const physicality = Math.min(99, Math.max(30, Math.round(basePhysicality + (averageRating - 6) * 10 + (matchesPlayed * 0.5))));

    return {
      ovr,
      attributes: [
        { subject: 'Pace', value: pace, fullMark: 99 },
        { subject: 'Shooting', value: shooting, fullMark: 99 },
        { subject: 'Passing', value: passing, fullMark: 99 },
        { subject: 'Dribbling', value: dribbling, fullMark: 99 },
        { subject: 'Defending', value: defending, fullMark: 99 },
        { subject: 'Physicality', value: physicality, fullMark: 99 },
      ]
    };
  }
}
