import React, { useState } from 'react';
import { loadLevel } from '../../constants/newExercises';
import { GameEngine } from './GameEngine';

export const InteractiveQuestionController: React.FC<{ level: number, onComplete: (xp: number, playNext?: boolean) => void, onClose: () => void }> = ({ level, onComplete, onClose }) => {
  const [questions] = useState(() => loadLevel(level));

  return (
    <GameEngine 
        questions={questions}
        level={level}
        onComplete={onComplete}
        onClose={onClose}
    />
  );
};
