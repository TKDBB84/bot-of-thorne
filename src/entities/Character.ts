import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { CotRanks } from '../consts.js';
import User from './User.js';
import PromotionRequest from './PromotionRequest.js';
import AbsentRequest from './AbsentRequest.js';

@Entity({ database: 'cotbot', name: 'characters' })
export default class Character {
  @PrimaryGeneratedColumn({ type: 'int' })
  public id: number;

  @Column({ type: 'bigint', nullable: true })
  public apiId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: false })
  public name = '';

  @Column({ type: 'varchar', length: 255, nullable: false, default: '' })
  public avatar = '';

  @Column({ type: 'varchar', length: 255, nullable: false, default: '' })
  public portrait = '';

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  public free_company_id: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  public free_company_name: string | null;

  @Column({ type: 'datetime', nullable: true })
  public first_seen_in_fc: Date | null;

  @Column({ type: 'datetime', nullable: true })
  public last_seen_in_fc: Date | null;

  @Column({
    default: CotRanks.NEW,
    enum: CotRanks,
    type: 'enum',
    nullable: false,
  })
  public rank: CotRanks = CotRanks.NEW;

  @Column({ type: 'timestamp', nullable: true, default: null })
  public last_promotion: Date | null;

  @ManyToOne(() => User, (user) => user.characters, { eager: true, nullable: true })
  public user: Relation<User> | null;

  @OneToMany(() => PromotionRequest, (promotion) => promotion.character, { eager: true, nullable: true })
  promotions: Relation<Array<PromotionRequest>> | null;

  @OneToMany(() => AbsentRequest, (absence) => absence.character, { eager: true, nullable: true })
  absences: Relation<Array<AbsentRequest>> | null;
}
