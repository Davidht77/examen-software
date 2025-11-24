import { Evaluation } from '../src/models/Evaluation';
import { GradeCalculator } from '../src/services/GradeCalculator';
import { StudentRecord } from '../src/models/StudentRecord';

const buildRecord = (overrides: Partial<StudentRecord>): StudentRecord => ({
  id: 'student-1',
  evaluations: [],
  hasReachedMinimumClasses: true,
  allYearsTeachers: [true],
  allowExtraPoints: true,
  manualExtraPoints: 1,
  ...overrides
});

describe('GradeCalculator', () => {
  const calculator = new GradeCalculator();

  test('should calculate final grade with extra points when attendance and agreement are met', () => {
    const record = buildRecord({
      evaluations: [
        new Evaluation({ name: 'Exam 1', score: 18, weight: 50 }),
        new Evaluation({ name: 'Exam 2', score: 16, weight: 50 })
      ],
      hasReachedMinimumClasses: true,
      allYearsTeachers: [true, true],
      allowExtraPoints: true,
      manualExtraPoints: 1
    });

    const report = calculator.calculate(record);

    expect(report.baseGrade).toBe(17);
    expect(report.extraPointsApplied).toBe(1);
    expect(report.finalGrade).toBe(18);
    expect(report.extraPointsAvoided).toEqual([]);
  });

  test('should return zero final grade when attendance is not met', () => {
    const record = buildRecord({
      evaluations: [new Evaluation({ name: 'Midterm', score: 15, weight: 100 })],
      hasReachedMinimumClasses: false,
      allYearsTeachers: [true],
      allowExtraPoints: true
    });

    const report = calculator.calculate(record);

    expect(report.baseGrade).toBe(15);
    expect(report.finalGrade).toBe(0);
    expect(report.extraPointsApplied).toBe(0);
    expect(report.extraPointsAvoided).toContain('Attendance requirement not met');
  });

  test('should avoid extra points when teachers are not unanimous', () => {
    const record = buildRecord({
      evaluations: [new Evaluation({ name: 'Lab', score: 19, weight: 100 })],
      hasReachedMinimumClasses: true,
      allYearsTeachers: [true, false],
      allowExtraPoints: true
    });

    const report = calculator.calculate(record);

    expect(report.extraPointsApplied).toBe(0);
    expect(report.extraPointsAvoided).toContain(
      'No hubo acuerdo unánime entre los docentes para puntos extra'
    );
    expect(report.finalGrade).toBe(19);
  });

  test('should cap final grade to 20 even with extra points', () => {
    const record = buildRecord({
      evaluations: [new Evaluation({ name: 'Project', score: 20, weight: 100 })],
      hasReachedMinimumClasses: true,
      allYearsTeachers: [true, true],
      manualExtraPoints: 3,
      allowExtraPoints: true
    });

    const report = calculator.calculate(record);

    expect(report.baseGrade).toBe(20);
    expect(report.finalGrade).toBe(20);
  });

  test('should throw when total weight exceeds 100%', () => {
    const record = buildRecord({
      evaluations: [
        new Evaluation({ name: 'Quiz', score: 12, weight: 60 }),
        new Evaluation({ name: 'Final', score: 18, weight: 50 })
      ]
    });

    expect(() => calculator.calculate(record)).toThrow('suma de pesos no puede superar 100%');
  });

  test('should report inconsistency when no evaluations are provided', () => {
    const record = buildRecord({
      evaluations: [],
      allYearsTeachers: [false, false],
      allowExtraPoints: false,
      manualExtraPoints: 0
    });

    const report = calculator.calculate(record);

    expect(report.baseGrade).toBe(0);
    expect(report.inconsistencies).toContain('No se registraron evaluaciones');
    expect(report.extraPointsApplied).toBe(0);
  });

  test('should avoid manual extra points when teacher does not allow them', () => {
    const record = buildRecord({
      evaluations: [new Evaluation({ name: 'Exam', score: 18, weight: 100 })],
      allowExtraPoints: false,
      manualExtraPoints: 2
    });

    const report = calculator.calculate(record);
    expect(report.extraPointsApplied).toBe(0);
    expect(report.extraPointsAvoided).toContain('El docente actual desactivó los puntos extra');
    expect(report.finalGrade).toBe(18);
  });

  test('should throw when manual extra points exceed allowed maximum', () => {
    const record = buildRecord({
      manualExtraPoints: 10
    });

    expect(() => calculator.calculate(record)).toThrow('puntos extra manuales no pueden superar');
  });
});
