import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Player, MatchResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const matchSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    myScore: { type: Type.INTEGER, description: "Goals scored by user's team" },
    opponentScore: { type: Type.INTEGER, description: "Goals scored by opponent" },
    summary: { type: Type.STRING, description: "A brief, exciting commentary summary of the match (max 2 sentences)." },
    events: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          minute: { type: Type.INTEGER },
          type: { type: Type.STRING, enum: ["goal", "card", "sub", "whistle"] },
          description: { type: Type.STRING },
          playername: { type: Type.STRING, description: "Name of the player involved if applicable" }
        }
      }
    },
    playerStats: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Must match a name from the roster provided exactly." },
          goals: { type: Type.INTEGER },
          assists: { type: Type.INTEGER },
          saves: { type: Type.INTEGER },
          rating: { type: Type.NUMBER, description: "Performance rating 1.0 to 10.0" },
          yellowCard: { type: Type.BOOLEAN },
          redCard: { type: Type.BOOLEAN },
          minutesPlayed: { type: Type.INTEGER }
        },
        required: ["name", "goals", "assists", "rating", "minutesPlayed"]
      }
    }
  },
  required: ["myScore", "opponentScore", "summary", "playerStats"]
};

export const simulateMatch = async (roster: Player[], opponentName: string): Promise<MatchResult> => {
  const playerList = roster.map(p => `${p.name} (${p.position})`).join(", ");

  const prompt = `
    Simulate a realistic fantasy football match between 'My Team' and '${opponentName}'.
    
    My Team Roster: ${playerList}.
    
    Logic for simulation:
    - Determine a realistic scoreline.
    - Assign realistic stats to my players based on their position (e.g., GK gets saves, FWD gets goals).
    - Ratings should average around 6-7, with good performances being 8+, bad being <5.
    - 'Ignacio' is the coach, give him stats but he doesn't play minutes (minutesPlayed: 0).
    - Not all players must play. Some can have 0 minutes.
    - Generate key match events.
    
    Return pure JSON adhering to the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: matchSchema,
      },
    });

    const data = JSON.parse(response.text || "{}");
    
    // Transform array of stats to object keyed by name for easier lookup
    const statsMap: Record<string, any> = {};
    if (data.playerStats && Array.isArray(data.playerStats)) {
      data.playerStats.forEach((stat: any) => {
        statsMap[stat.name] = stat;
      });
    }

    return {
      opponent: opponentName,
      myScore: data.myScore,
      opponentScore: data.opponentScore,
      summary: data.summary,
      events: data.events || [],
      playerStats: statsMap
    };

  } catch (error) {
    console.error("Match simulation failed:", error);
    throw new Error("Failed to simulate match. Please try again.");
  }
};