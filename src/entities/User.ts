import { Column, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm';
import Character from './Character.js';

@Entity({ database: 'cotbot', name: 'discord_users' })
export default class User {
  @PrimaryColumn({ type: 'bigint' })
  public id: string;

  @Column({ type: 'varchar', length: 14, default: 'Etc/UTC', nullable: false })
  public timezone: string = 'Etc/UTC';

  @Column({ type: 'timestamp', default: 'NOW()', nullable: false })
  public first_seen: Date = new Date();

  @Column({ type: 'timestamp', default: 'NOW()', nullable: false, onUpdate: 'NOW()' })
  public last_seen: Date = new Date();

  @OneToMany(() => Character, (character) => character.user, {
    eager: true,
    nullable: true,
  })
  public characters: Relation<Array<Character>> | null;
}
