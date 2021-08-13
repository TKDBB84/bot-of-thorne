import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export default class SpamChannel {
  @PrimaryColumn()
  public guildId!: string;

  @Column()
  public channelId!: string;

  @Column()
  public timezone!: string;
}
