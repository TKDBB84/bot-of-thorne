import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import COTMember from './COTMember';

@Entity()
export default class AbsentRequest {
  @PrimaryGeneratedColumn()
  public id!: number;

  @CreateDateColumn()
  public requested!: Date;

  @Column()
  public startDate!: Date;

  @Column()
  public endDate!: Date;

  @ManyToOne(() => COTMember, (cotMember: COTMember) => cotMember.absences, { eager: true })
  public CotMember!: COTMember;
}
