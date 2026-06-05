import React from 'react';
import { Heart } from 'lucide-react';

interface Props {
  lives: number;
}

export const HeartsDisplay: React.FC<Props> = ({ lives }) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Heart 
          key={i} 
          size={24} 
          className={i < lives ? "fill-red-500 text-red-500" : "fill-slate-200 text-slate-200"} 
        />
      ))}
    </div>
  );
};
