import React from 'react';

interface Props {
  progress: number;
}

export const ProgressBar: React.FC<Props> = ({ progress }) => {
  return (
    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
      <div 
        className="bg-green-500 h-full transition-all duration-500 ease-out" 
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
