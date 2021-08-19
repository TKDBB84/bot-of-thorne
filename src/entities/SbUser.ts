import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import Event from './Event';
import Quote from './Quote';

@Entity()
export default class SbUser {
  @PrimaryColumn()
  public discordUserId!: string;

  @Column()
  public timezone!: string;

  @OneToMany(() => Quote, (quote) => quote.user)
  public quotes!: Quote[];

  @OneToMany(() => Event, (event) => event.user)
  public events!: Event[];
}
