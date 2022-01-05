import { CommandInteraction } from 'discord.js';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types';

export declare interface SlashCommand {
  readonly command: string;
  readonly commandRegistrationData: RESTPostAPIApplicationCommandsJSONBody;
  readonly exec: (interaction: CommandInteraction) => Promise<void>;
}
