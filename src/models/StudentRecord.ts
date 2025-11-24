import { Evaluation } from './Evaluation';

export interface StudentRecord {
  id: string;
  evaluations: Evaluation[];
  hasReachedMinimumClasses: boolean;
  allYearsTeachers: boolean[];
  allowExtraPoints: boolean;
  manualExtraPoints: number;
}

export interface GradeReport {
  studentId: string;
  baseGrade: number;
  extraPointsApplied: number;
  finalGrade: number;
  evaluationBreakdown: Array<{
    name: string;
    score: number;
    weight: number;
    contribution: number;
  }>;
  inconsistencies: string[];
  extraPointsAvoided: string[];
}
