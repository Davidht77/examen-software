import express, { Request, Response } from 'express';
import path from 'node:path';
import { Evaluation } from './models/Evaluation';
import { GradeCalculator } from './services/GradeCalculator';
import { StudentCache } from './repositories/StudentCache';
import { StudentRecord } from './models/StudentRecord';

const app = express();
app.disable('x-powered-by');
const port = process.env.PORT || 3000;
const studentCache = new StudentCache();
const calculator = new GradeCalculator();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/students/:id', (req: Request, res: Response) => {
  const student = studentCache.get(req.params.id);
  if (!student) {
    return res.status(404).json({ message: 'Estudiante no encontrado' });
  }
  res.json(student);
});

app.get('/api/students', (_req: Request, res: Response) => {
  res.json(studentCache.list());
});

app.post('/api/students/:id', (req: Request, res: Response) => {
  try {
    const record = buildStudentRecord(req.params.id, req.body);
    studentCache.upsert(record);
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

app.post('/api/students/:id/calculate', (req: Request, res: Response) => {
  try {
    let record = studentCache.get(req.params.id);
    if (!record) {
      record = buildStudentRecord(req.params.id, req.body);
      studentCache.upsert(record);
    }
    const report = calculator.calculate(record);
    res.json(report);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

function buildStudentRecord(id: string, payload: Record<string, unknown>): StudentRecord {
  const evaluationsInput = Array.isArray(payload.evaluations) ? payload.evaluations : [];
  const evaluations = evaluationsInput.map((item: any) => {
    return new Evaluation({
      name: String(item.name ?? ''),
      score: Number(item.score),
      weight: Number(item.weight)
    });
  });

  return {
    id,
    evaluations,
    hasReachedMinimumClasses: Boolean(payload.hasReachedMinimumClasses),
    allYearsTeachers: Array.isArray(payload.allYearsTeachers)
      ? payload.allYearsTeachers.map(Boolean)
      : [],
    allowExtraPoints: Boolean(payload.allowExtraPoints),
    manualExtraPoints: Number(payload.manualExtraPoints ?? 0)
  };
}

export function startServer() {
  return app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`CS-GradeCalculator running on port ${port}`);
  });
}

if (require.main === module) {
  startServer();
}

export default app;
