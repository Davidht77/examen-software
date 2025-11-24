import request from 'supertest';
import app from '../src/server';

describe('Server API', () => {
  test('should upsert and retrieve a student', async () => {
    const studentId = 'api-student';
    const payload = {
      evaluations: [{ name: 'Exam', score: 15, weight: 100 }],
      hasReachedMinimumClasses: true,
      allYearsTeachers: [true, true],
      allowExtraPoints: true,
      manualExtraPoints: 1
    };

    const createResponse = await request(app).post(`/api/students/${studentId}`).send(payload);
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.id).toBe(studentId);

    const getResponse = await request(app).get(`/api/students/${studentId}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.evaluations).toHaveLength(1);
  });

  test('should calculate grade via API', async () => {
    const studentId = 'calc-student';
    const payload = {
      evaluations: [
        { name: 'Quiz', score: 18, weight: 40 },
        { name: 'Project', score: 20, weight: 60 }
      ],
      hasReachedMinimumClasses: true,
      allYearsTeachers: [true, true],
      allowExtraPoints: true,
      manualExtraPoints: 1
    };

    const response = await request(app).post(`/api/students/${studentId}/calculate`).send(payload);
    expect(response.status).toBe(200);
    expect(response.body.finalGrade).toBe(20);
    expect(response.body.evaluationBreakdown).toHaveLength(2);
  });

  test('should reject calculations when total weight exceeds 100', async () => {
    const studentId = 'invalid-weight';
    const payload = {
      evaluations: [
        { name: 'Quiz', score: 10, weight: 60 },
        { name: 'Lab', score: 10, weight: 60 }
      ],
      hasReachedMinimumClasses: true,
      allYearsTeachers: [true],
      allowExtraPoints: true,
      manualExtraPoints: 1
    };

    const response = await request(app).post(`/api/students/${studentId}/calculate`).send(payload);
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('suma de pesos no puede superar 100%');
  });
});
