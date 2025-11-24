import { Evaluation } from '../models/Evaluation';
import { GradeReport, StudentRecord } from '../models/StudentRecord';
import { AttendancePolicy } from '../policies/AttendancePolicy';
import { ExtraPointsConstants, ExtraPointsPolicy } from '../policies/ExtraPointsPolicy';

const MAX_FINAL_GRADE = 20;

export class GradeCalculator {
  public calculate(record: StudentRecord): GradeReport {
    this.validateManualExtra(record.manualExtraPoints);
    this.ensureValidWeights(record.evaluations);

    const attendancePolicy = new AttendancePolicy(record.hasReachedMinimumClasses);
    const extraPointsPolicy = new ExtraPointsPolicy(
      record.allYearsTeachers,
      record.allowExtraPoints,
      record.manualExtraPoints
    );

    const evaluationBreakdown = record.evaluations.map((evaluation) => ({
      name: evaluation.name,
      score: evaluation.score,
      weight: evaluation.weight,
      contribution: this.roundTwoDecimals(evaluation.getWeightedScore())
    }));

    const baseGrade = this.roundTwoDecimals(
      evaluationBreakdown.reduce((sum, current) => sum + current.contribution, 0)
    );

    const inconsistencies: string[] = [];
    const extraPointsAvoided: string[] = [];

    const totalWeight = record.evaluations.reduce((sum, evaluation) => sum + evaluation.weight, 0);
    if (record.evaluations.length === 0) {
      inconsistencies.push('No se registraron evaluaciones');
    }
    if (totalWeight < 100) {
      inconsistencies.push('La suma de pesos es menor a 100%');
    } else if (totalWeight > 100) {
      inconsistencies.push('La suma de pesos supera el 100%');
    }

    if (!attendancePolicy.isEligible()) {
      extraPointsAvoided.push('Attendance requirement not met');
      return {
        studentId: record.id,
        baseGrade,
        extraPointsApplied: 0,
        finalGrade: 0,
        evaluationBreakdown,
        inconsistencies: [...inconsistencies, attendancePolicy.reasonWhenIneligible()].filter(Boolean),
        extraPointsAvoided
      };
    }

    const extraPointsResult = extraPointsPolicy.evaluate();
    if (extraPointsResult.avoidedReason) {
      extraPointsAvoided.push(extraPointsResult.avoidedReason);
    }

    const uncappedFinal = baseGrade + extraPointsResult.points;
    const finalGrade = this.roundTwoDecimals(Math.min(uncappedFinal, MAX_FINAL_GRADE));

    return {
      studentId: record.id,
      baseGrade,
      extraPointsApplied: extraPointsResult.points,
      finalGrade,
      evaluationBreakdown,
      inconsistencies,
      extraPointsAvoided
    };
  }

  private ensureValidWeights(evaluations: Evaluation[]): void {
    const totalWeight = evaluations.reduce((sum, evaluation) => sum + evaluation.weight, 0);
    if (totalWeight > 100) {
      throw new Error('La suma de pesos no puede superar 100%');
    }
  }

  private roundTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private validateManualExtra(points: number): void {
    if (!Number.isFinite(points) || points < 0) {
      throw new Error('Los puntos extra manuales deben ser cero o positivos');
    }
    if (points > ExtraPointsConstants.MAX_MANUAL_EXTRA_POINTS) {
      throw new Error(
        `Los puntos extra manuales no pueden superar ${ExtraPointsConstants.MAX_MANUAL_EXTRA_POINTS}`
      );
    }
  }
}

export const GradeCalculatorConstants = {
  MAX_FINAL_GRADE
} as const;
