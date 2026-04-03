export interface Prompt {
  id: string;
  task: number;
  type: string;
  text: string;
  min_words: number;
}

export interface AttemptScores {
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
  overall: number;
}

export interface AttemptFeedback {
  task_feedback: string;
  coherence_feedback: string;
  lexical_feedback: string;
  grammar_feedback: string;
  errors: string[];
  corrections: string[];
  improvement_tips: string[];
  band_level: string;
}

export interface Attempt {
  id: string;
  user_id: string;
  prompt_id: string;
  essay: string;
  word_count: number;
  time_taken: number;
  task_score: number | null;
  coherence_score: number | null;
  lexical_score: number | null;
  grammar_score: number | null;
  overall_score: number | null;
  feedback: AttemptFeedback | null;
  created_at: string;
  prompts?: Prompt;
}
