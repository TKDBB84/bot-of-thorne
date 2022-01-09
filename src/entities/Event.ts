import { Column, Entity, getManager, ManyToOne, MoreThanOrEqual, PrimaryGeneratedColumn } from 'typeorm';
import SbUser from './SbUser';

@Entity()
export default class Event {
  public static async getAll(guildId: string): Promise<Event[]> {
    const FOUR_HOURS_AGO = new Date();
    FOUR_HOURS_AGO.setTime(new Date().getTime() - 4 * (60 * 60 * 1000));
    const eventRepo = getManager().getRepository<Event>(Event);
    return eventRepo.find({
      order: { eventTime: 'ASC' },
      where: { eventTime: MoreThanOrEqual<Date>(FOUR_HOURS_AGO), guildId },
    });
  }

  public static async findByName(name: string, guildId: string): Promise<Event | undefined> {
    const FOUR_HOURS_AGO = new Date();
    FOUR_HOURS_AGO.setTime(new Date().getTime() - 4 * (60 * 60 * 1000));
    const eventRepo = getManager().getRepository<Event>(Event);
    return eventRepo.findOne({
      where: { eventName: name, eventTime: MoreThanOrEqual<Date>(FOUR_HOURS_AGO), guildId },
    });
  }

  public static async delete(id: number): Promise<true> {
    const eventRepo = getManager().getRepository<Event>(Event);
    return !!(await eventRepo.delete(id));
  }

  @PrimaryGeneratedColumn()
  public id!: number;

  @Column('string')
  public guildId!: string;

  @Column('string')
  public eventName!: string;

  @ManyToOne(() => SbUser, (user) => user.events, { eager: true })
  public user!: SbUser;

  @Column('datetime')
  public eventTime!: Date;
  //
  // @Column({
  //   type: 'enum',
  //   enum:
  //   default:
  // })
  // public reoccuring!:
}
