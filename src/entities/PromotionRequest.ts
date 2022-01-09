import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CotRanks } from '../consts.js';
import COTMember from './COTMember.js';

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
  public CotMember!: COTMember;
}
