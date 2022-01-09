import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import SbUser from './SbUser';

@Entity()
export default class Quote {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column('string')
  public guildId!: string;

  @Column('string')
  public channelId!: string;

  @Column('string')
  public messageId!: string;

  @CreateDateColumn()
  public created!: Date;

  @Column('string')
  public quoteText!: string;

  @ManyToOne(() => SbUser, (user) => user.quotes, { eager: true })
  public user!: SbUser;
}
