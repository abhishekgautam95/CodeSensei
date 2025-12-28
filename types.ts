
export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface CodingProblem {
  title: string;
  description: string;
  industryContext: string;
  inputFormat: string;
  outputFormat: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  testCases: TestCase[];
  tags: string[];
}

export interface EvaluationResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
  hint?: string;
  mistakes?: string[];
  optimization?: string;
  explanation: string;
  timeComplexity: string;
  spaceComplexity: string;
  cleanlinessScore: number;
}

export interface UserStats {
  xp: number;
  rank: string;
  solvedCount: number;
  streak: number;
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  CONTEST_READY = 'CONTEST_READY',
  JUDGING = 'JUDGING',
  RESULT_READY = 'RESULT_READY'
}
