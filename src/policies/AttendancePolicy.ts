export class AttendancePolicy {
  constructor(private readonly minimumReached: boolean) {}

  public isEligible(): boolean {
    return this.minimumReached;
  }

  public reasonWhenIneligible(): string {
    return this.minimumReached ? '' : 'El estudiante no cumplió la asistencia mínima';
  }
}
