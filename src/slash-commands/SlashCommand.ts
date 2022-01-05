import { CommandInteraction } from 'discord.js';
import { APIApplicationCommandOption } from '@discordjs/builders/node_modules/discord-api-types/payloads/v9/_interactions/slashCommands';

export type CommandRegistrationData = {
  name: string;
  description: string;
  options: APIApplicationCommandOption[];
  default_permission: boolean | undefined;
};

export declare interface SlashCommand {
  readonly command: string;
  readonly commandRegistrationData: CommandRegistrationData;
  readonly exec: (interaction: CommandInteraction) => Promise<void>;
}
