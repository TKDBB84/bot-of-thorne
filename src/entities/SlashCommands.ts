import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ database: 'cotbot', name: 'slash_commands' })
export default class SlashCommand {
  @PrimaryGeneratedColumn({ type: 'int' })
  public id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  public commandName: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  public filePath: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  public checksum: string;
}
