
export interface LevelConfig {
  difficulty: 'easy' | 'medium' | 'hard';
}

export const LEVEL_CONFIG: Record<number, LevelConfig> = (() => {
  const acc: Record<number, LevelConfig> = {};
  for (let i = 0; i < 100; i++) {
    const level = i + 1;
    let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
    if (level > 20) difficulty = 'medium';
    if (level > 50) difficulty = 'hard';
    acc[level] = { difficulty };
  }
  return acc;
})();
