export class SportEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly userId: string,
    public readonly createdAt: Date
  ) {}

  public static create(id: string, name: string, userId: string): SportEntity {
    return new SportEntity(id, name, userId, new Date());
  }
}
