import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { CotRanks } from '../consts';
import COTMember from './COTMember';

@Entity()
export default class PromotionRequest {
  @PrimaryGeneratedColumn()
  public id!: number;

  @CreateDateColumn()
  public requested!: Date;

  @Column({
    default: CotRanks.MEMBER,
    enum: CotRanks,
    type: 'enum',
  })
  public toRank!: CotRanks;

  @ManyToOne(() => COTMember, (cotMember: COTMember) => cotMember.promotions, { eager: true })
  public CotMember!: Relation<COTMember>;
}
