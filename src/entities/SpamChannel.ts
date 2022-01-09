import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export default class SpamChannel {
  @PrimaryColumn('string')
  public guildId!: string;

  @Column('string')
  public channelId!: string;

  @Column('string')
  public timezone!: string;
}
