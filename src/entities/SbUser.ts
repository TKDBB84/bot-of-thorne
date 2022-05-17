import { Column, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm';
import Event from './Event.js';
import Quote from './Quote.js';

@Entity()
export default class SbUser {
  @PrimaryColumn()
  public discordUserId!: string;

  @Column()
  public timezone!: string;

  @OneToMany(() => Quote, (quote) => quote.user)
  public quotes!: Relation<Quote[]>;

  @OneToMany(() => Event, (event) => event.user)
  public events!: Relation<Event[]>;
}
