import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { CoTAPIId, CotRanks } from '../consts.js';
import PromotionRequest from './PromotionRequest.js';
import AbsentRequest from './AbsentRequest.js';
import { XIVCharacter } from '../lib/nodestone/index.js';
import dataSource from '../data-source.js';

@Entity({ database: 'cotbot', name: 'characters' })
export default class Character {
  @PrimaryGeneratedColumn({ type: 'int' })
  public id: number;

  @Index({ unique: true })
  @Column({ type: 'bigint', nullable: true })
  public apiId: string | null;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: false })
  public name = '';

  @Column({ type: 'varchar', length: 255, nullable: false, default: '' })
  public avatar = '';

  @Column({ type: 'varchar', length: 255, nullable: false, default: '' })
  public portrait = '';

  @Index()
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

  @Column({ type: 'datetime', nullable: true, default: null })
  public last_promotion: Date | null;

  @OneToMany(() => PromotionRequest, (promotion) => promotion.character, { nullable: true })
  promotions: Relation<Array<PromotionRequest>> | null;

  @OneToMany(() => AbsentRequest, (absence) => absence.character, { nullable: true })
  absences: Relation<Array<AbsentRequest>> | null;

  public static async createFromNodestoneData(xivCharacter: XIVCharacter): Promise<Character> {
    const characterRepo = dataSource.getRepository<Character>(Character);
    const isCot = xivCharacter.FreeCompany?.ID === CoTAPIId;
    return await characterRepo.save(
      characterRepo.create({
        apiId: xivCharacter.ID.toString(),
        name: xivCharacter.Name,
        avatar: xivCharacter.Avatar,
        portrait: xivCharacter.Portrait,
        free_company_id: xivCharacter.FreeCompany?.ID || null,
        free_company_name: isCot ? 'Crowne of Thorne' : null,
        first_seen_in_fc: isCot ? new Date() : null,
        last_seen_in_fc: isCot ? new Date() : null,
        last_promotion: null,
      }),
    );
  }
}
