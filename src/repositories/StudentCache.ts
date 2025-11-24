import { StudentRecord } from '../models/StudentRecord';

export class StudentCache {
  private readonly students: Map<string, StudentRecord> = new Map();

  public upsert(record: StudentRecord): StudentRecord {
    if (!record.id.trim()) {
      throw new Error('El código del estudiante es obligatorio');
    }
    this.students.set(record.id, record);
    return record;
  }

  public get(id: string): StudentRecord | undefined {
    return this.students.get(id);
  }

  public list(): StudentRecord[] {
    return Array.from(this.students.values());
  }
}
