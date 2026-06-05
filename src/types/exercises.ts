export type QuestionType = 'WORD_BANK' | 'MATCHING_PAIRS' | 'MULTIPLE_CHOICE';

interface BaseQuestion {
  id: string;
  type: QuestionType;
  hindi: string;
  english: string;
}

export interface WordBankQuestion extends BaseQuestion {
  type: 'WORD_BANK';
  options?: string[]; 
  chips?: string[];
  correctOrder: string[]; 
}

export interface MatchingPairsQuestion extends BaseQuestion {
  type: 'MATCHING_PAIRS';
  pairs: { english: string, hindi: string }[];
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'MULTIPLE_CHOICE';
  options: string[];
  correctAnswer: string;
}

export type Question = WordBankQuestion | MatchingPairsQuestion | MultipleChoiceQuestion;
