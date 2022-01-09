import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import SbUser from './SbUser.js';

@Entity()
export default class FFXIVChar {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column('integer')
  public apiId!: number;

  @Column({ charset: 'utf8', collation: 'utf8_general_ci', type: 'string' })
  public name!: string;

  @Column('datetime')
  public firstSeenApi!: Date;

  @Column('datetime')
  public lastSeenApi!: Date;

  @OneToOne(() => SbUser, { eager: true, nullable: true })
  @JoinColumn()
  public user!: SbUser;
}
