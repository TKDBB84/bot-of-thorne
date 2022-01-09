import type { CommandInteraction } from 'discord.js';
import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types';

export declare interface SlashCommand {
  readonly command: string;
  readonly commandRegistrationData: RESTPostAPIApplicationCommandsJSONBody;
  exec(interaction: CommandInteraction): Promise<void>;
  exec(interaction: CommandInteraction<'present'>): Promise<void>;
}

export declare interface GlobalSlashCommand extends SlashCommand {
  readonly exec: (interaction: CommandInteraction) => Promise<void>;
}

export declare interface GuildSlashCommand extends SlashCommand {
  readonly exec: (interaction: CommandInteraction<'present'>) => Promise<void>;
}
