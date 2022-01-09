import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import Event from './Event.js';
import Quote from './Quote.js';

@Entity()
export default class SbUser {
  @PrimaryColumn('string')
  public discordUserId!: string;

  @Column('string')
  public timezone!: string;

  @OneToMany(() => Quote, (quote) => quote.user)
  public quotes!: Quote[];

  @OneToMany(() => Event, (event) => event.user)
  public events!: Event[];
}
