import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import SbUser from './SbUser.js';

@Entity()
export default class Quote {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public guildId!: string;

  @Column()
  public channelId!: string;

  @Column()
  public messageId!: string;

  @CreateDateColumn()
  public created!: Date;

  @Column()
  public quoteText!: string;

  @ManyToOne(() => SbUser, (user) => user.quotes, { eager: true })
  public user!: Relation<SbUser>;
}
