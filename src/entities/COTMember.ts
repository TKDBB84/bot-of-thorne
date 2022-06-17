import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import getDataSource from '../data-source.js';
import { CotRanks } from '../consts.js';
import AbsentRequest from './AbsentRequest.js';
import FFXIVChar from './FFXIVChar.js';
import PromotionRequest from './PromotionRequest.js';
import SbUser from './SbUser.js';

@Entity()
export default class COTMember {
  public static async getCotMemberByName(
    charName: string,
    discordUserId: string,
    rank: CotRanks = CotRanks.NEW,
  ): Promise<COTMember> {
    const dataSource = await getDataSource();
    const cotPlayerRepo = dataSource.getRepository(FFXIVChar);
    const cotMemberRepo = dataSource.getRepository(COTMember);
    const sbUserRepo = dataSource.getRepository(SbUser);

    let sbUser = await sbUserRepo.findOne({ where: { discordUserId } });
    if (!sbUser) {
      sbUser = new SbUser();
      sbUser.discordUserId = discordUserId;
      sbUser = await sbUserRepo.save(sbUser, { reload: true });
    }
    let cotPlayer = await cotPlayerRepo.findOne({
      where: { user: { discordUserId } },
    });

    if (!cotPlayer) {
      const nameMatch = await cotPlayerRepo
        .createQueryBuilder()
        .where('LOWER(name) = LOWER(:name)', { name: charName.toLowerCase() })
        .getOne();
      if (!nameMatch) {
        cotPlayer = new FFXIVChar();
        cotPlayer.user = sbUser;
        cotPlayer.name = charName;
        cotPlayer = await cotPlayerRepo.save(cotPlayer, { reload: true });
      } else {
        cotPlayer = nameMatch;
        await cotPlayerRepo.update(cotPlayer.id, { user: sbUser });
      }
    }

    let cotMember = await cotMemberRepo.createQueryBuilder().where('characterId = :id', { id: cotPlayer.id }).getOne();
    const foundMember = cotMember;
    if (!cotMember) {
      cotMember = new COTMember();
      cotMember.character = cotPlayer;
      cotMember.rank = rank;
      cotMember.firstSeenDiscord = new Date();
      if (rank !== CotRanks.NEW) {
        try {
          cotMember = await cotMemberRepo.save(cotMember, { reload: true });
        } catch (error: unknown) {
          console.error('error saving member', [error, foundMember, cotMember]);
          throw error;
        }
      }
    } else {
      const firstSeenDiscord = cotMember.firstSeenDiscord ? cotMember.firstSeenDiscord : new Date();
      await cotMemberRepo.update(cotMember.id, { firstSeenDiscord, character: cotPlayer });
    }
    cotPlayer.user = sbUser;
    cotMember.character = cotPlayer;
    return cotMember;
  }

  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({
    default: CotRanks.NEW,
    enum: CotRanks,
    type: 'enum',
  })
  public rank!: CotRanks;

  @Column()
  public firstSeenDiscord!: Date;

  @Column()
  public lastPromotion!: Date;

  @OneToMany(() => PromotionRequest, (promotionRequest: PromotionRequest) => promotionRequest.CotMember)
  public promotions!: Relation<PromotionRequest[]>;

  @OneToMany(() => AbsentRequest, (absentRequest: AbsentRequest) => absentRequest.CotMember)
  public absences!: Relation<AbsentRequest[]>;

  @OneToOne(() => FFXIVChar, { eager: true })
  @JoinColumn()
  public character!: Relation<FFXIVChar>;

  public async promote(): Promise<COTMember> {
    let newRank;
    switch (this.rank) {
      case CotRanks.NEW:
        newRank = CotRanks.RECRUIT;
        break;
      case CotRanks.MEMBER:
        newRank = CotRanks.VETERAN;
        break;
      case CotRanks.VETERAN:
        newRank = CotRanks.OFFICER;
        break;
      default:
      case CotRanks.RECRUIT:
        newRank = CotRanks.MEMBER;
        break;
    }
    const lastPromotion = new Date();
    const dataSource = await getDataSource();
    await dataSource.getRepository(COTMember).update(this.id, { lastPromotion, rank: newRank });
    const updatedMember = await dataSource.getRepository(COTMember).findOne({ where: { id: this.id } });
    if (!updatedMember) {
      throw new Error('same member not found?');
    }
    return updatedMember;
  }
}
