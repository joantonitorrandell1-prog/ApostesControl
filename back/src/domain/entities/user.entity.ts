import { UserRole } from '../../@types/contract';

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly role: UserRole,
    public readonly requirePasswordChange: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public static create(
    id: string,
    name: string,
    email: string,
    role: UserRole = 'USER',
    requirePasswordChange = false
  ): UserEntity {
    const now = new Date();
    return new UserEntity(id, name, email, role, requirePasswordChange, now, now);
  }
}
