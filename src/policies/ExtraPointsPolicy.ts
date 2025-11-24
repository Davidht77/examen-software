const MAX_MANUAL_EXTRA_POINTS = 5;

export interface ExtraPointsResult {
  points: number;
  reason?: string;
  avoidedReason?: string;
}

export class ExtraPointsPolicy {
  constructor(
    private readonly teachersAgreement: boolean[],
    private readonly allowExtraPoints: boolean,
    private readonly manualExtraPoints: number
  ) {}

  public evaluate(): ExtraPointsResult {
    if (!this.teachersAgreement.length) {
      return { points: 0, avoidedReason: 'No hay votos de docentes para puntos extra' };
    }

    if (!this.allowExtraPoints) {
      return { points: 0, avoidedReason: 'El docente actual desactivó los puntos extra' };
    }

    const unanimousAgreement = this.teachersAgreement.every(Boolean);
    if (!unanimousAgreement) {
      return {
        points: 0,
        avoidedReason: 'No hubo acuerdo unánime entre los docentes para puntos extra'
      };
    }

    const appliedPoints = Math.min(this.manualExtraPoints, MAX_MANUAL_EXTRA_POINTS);
    return {
      points: appliedPoints,
      reason: `Puntos extra otorgados manualmente (${appliedPoints})`
    };
  }
}

export const ExtraPointsConstants = {
  MAX_MANUAL_EXTRA_POINTS
} as const;
