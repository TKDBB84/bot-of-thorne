import type { CommandInteraction } from 'discord.js';
import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';

export declare interface SlashCommand {
  readonly command: string;
  readonly commandRegistrationData: RESTPostAPIApplicationCommandsJSONBody;
  readonly exec: (interaction: CommandInteraction) => Promise<void>;
}
