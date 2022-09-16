import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import Character from './Character.js';

@Entity({ database: 'cotbot', name: 'absent_requests' })
export default class AbsentRequest {
  @PrimaryGeneratedColumn({ type: 'int' })
  public id: number;

  @CreateDateColumn({ type: 'datetime', default: () => 'NOW()', nullable: false })
  public date_requested: Date = new Date();

  @Column({ type: 'date', nullable: false })
  public start_date: Date = new Date();

  @Column({ type: 'date', nullable: false })
  public end_date: Date = new Date();

  @ManyToOne(() => Character, (cotMember: Character) => cotMember.absences, { eager: true, nullable: false })
  public character: Relation<Character>;
}
