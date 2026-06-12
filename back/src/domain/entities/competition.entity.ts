export class CompetitionEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly sportId: string,
    public readonly createdAt: Date
  ) {}

  public static create(id: string, name: string, sportId: string): CompetitionEntity {
    return new CompetitionEntity(id, name, sportId, new Date());
  }
}
