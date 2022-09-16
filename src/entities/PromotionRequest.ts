import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { CotRankTo } from '../consts.js';
import Character from './Character.js';

@Entity({ database: 'cotbot', name: 'promotion_requests' })
export default class PromotionRequest {
  @PrimaryGeneratedColumn({ type: 'int' })
  public id: number;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP(6)', nullable: false })
  public date_requested: Date = new Date();

  @Column({
    default: CotRankTo.MEMBER,
    enum: CotRankTo,
    type: 'enum',
    nullable: false,
  })
  public to_rank: CotRankTo = CotRankTo.MEMBER;

  @ManyToOne(() => Character, (character: Character) => character.promotions, { eager: true, nullable: false })
  public character: Relation<Character>;
}
