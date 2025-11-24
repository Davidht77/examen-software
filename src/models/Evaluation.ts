export interface EvaluationProps {
  readonly name: string;
  readonly score: number;
  readonly weight: number;
}

const MAX_SCORE = 20;
const MIN_SCORE = 0;

export class Evaluation {
  public readonly name: string;
  public readonly score: number;
  public readonly weight: number;

  constructor(props: EvaluationProps) {
    this.validate(props);
    this.name = props.name.trim();
    this.score = props.score;
    this.weight = props.weight;
  }

  private validate({ name, score, weight }: EvaluationProps): void {
    if (!name?.trim()) {
      throw new Error('El nombre de la evaluación es obligatorio');
    }
    if (!Number.isFinite(score) || score < MIN_SCORE || score > MAX_SCORE) {
      throw new Error(`La nota debe estar entre ${MIN_SCORE} y ${MAX_SCORE}`);
    }
    if (!Number.isFinite(weight) || weight <= 0 || weight > 100) {
      throw new Error('El peso de la evaluación debe estar entre 0 y 100');
    }
  }

  public getWeightedScore(): number {
    return (this.score * this.weight) / 100;
  }
}

export const EvaluationConstants = {
  MAX_SCORE,
  MIN_SCORE
} as const;
