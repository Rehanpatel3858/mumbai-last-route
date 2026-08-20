export interface ScoreBreakdown {
  civiliansSaved: number;
  totalCivilians: number;
  timeRemainingSeconds: number;
  playerHealth: number;
  hazardHits: number;
  rescueScore: number;
  perfectBonus: number;
  timeBonus: number;
  healthBonus: number;
  hazardPenalty: number;
  totalScore: number;
  rank: 'S' | 'A' | 'B' | 'C' | 'D';
}

export function calculateScore(
  civiliansSaved: number,
  totalCivilians: number,
  timeRemainingSeconds: number,
  playerHealth: number,
  hazardHits: number
): ScoreBreakdown {
  const rescueScore = civiliansSaved * 1000;
  const perfectBonus = civiliansSaved === totalCivilians ? 2000 : 0;
  const timeBonus = Math.max(0, Math.floor(timeRemainingSeconds * 10));
  const healthBonus = Math.max(0, Math.floor(playerHealth * 5));
  const hazardPenalty = hazardHits * 150;

  const totalScore = Math.max(
    0,
    rescueScore + perfectBonus + timeBonus + healthBonus - hazardPenalty
  );

  let rank: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
  if (totalScore >= 9000) rank = 'S';
  else if (totalScore >= 7500) rank = 'A';
  else if (totalScore >= 6000) rank = 'B';
  else if (totalScore >= 4500) rank = 'C';
  else rank = 'D';

  return {
    civiliansSaved,
    totalCivilians,
    timeRemainingSeconds,
    playerHealth,
    hazardHits,
    rescueScore,
    perfectBonus,
    timeBonus,
    healthBonus,
    hazardPenalty,
    totalScore,
    rank
  };
}
