import { BetStatus } from '../../@types/contract';

export class BetEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly competitionId: string,
    public readonly amount: number,
    public readonly odds: number,
    public readonly earnings: number,
    public readonly isBonusCredit: boolean,
    public readonly status: BetStatus,
    public readonly date: Date,
    public readonly createdAt: Date
  ) {}

  public static create(
    id: string,
    userId: string,
    competitionId: string,
    amount: number,
    odds: number,
    isBonusCredit: boolean,
    status: BetStatus = 'PENDING',
    earnings = 0,
    date = new Date()
  ): BetEntity {
    // If status is WON, earnings = amount * odds. But wait! If it's bonus credit, net earnings = (amount * odds) - amount.
    // If status is LOST, earnings is 0.
    // If status is PENDING, earnings is 0.
    let computedEarnings = earnings;
    if (status === 'WON') {
      const gross = amount * odds;
      computedEarnings = isBonusCredit ? (gross - amount) : gross;
    } else if (status === 'LOST' || status === 'PENDING') {
      computedEarnings = 0;
    }

    return new BetEntity(
      id,
      userId,
      competitionId,
      amount,
      odds,
      computedEarnings,
      isBonusCredit,
      status,
      date,
      new Date()
    );
  }
}
