import { Column, Entity, PrimaryColumn } from 'typeorm';
import dataSource from '../data-source.js';

@Entity({ database: 'cotbot', name: 'discord_users' })
export default class User {
  @PrimaryColumn({ type: 'bigint' })
  public id: string;

  @Column({ type: 'varchar', length: 64, default: 'Etc/UTC', nullable: false })
  public timezone = 'Etc/UTC';

  @Column({ type: 'datetime', default: () => 'NOW()', nullable: false })
  public first_seen: Date = new Date();

  @Column({ type: 'timestamp', default: () => 'NOW()', nullable: false, onUpdate: 'NOW()' })
  public last_seen: Date = new Date();

  public static async touch(id: string): Promise<User> {
    const userRepo = dataSource.getRepository<User>(User);
    let user = await userRepo.findOne({ where: { id } });
    if (!user) {
      user = await userRepo.save(userRepo.create({ id, first_seen: new Date(), last_seen: new Date() }));
    } else {
      user.last_seen = new Date();
      await userRepo.update(user.id, { last_seen: user.last_seen });
    }
    return user;
  }

  public static touchInBackground(id: string): void {
    queueMicrotask(() => {
      void User.touch(id);
    });
  }
}
