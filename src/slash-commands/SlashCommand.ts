import { CommandInteraction } from 'discord.js';
import { APIApplicationCommandOption } from 'discord-api-types';

export declare interface SlashCommand {
  readonly command: string;
  readonly commandRegistrationData: {
    name: string;
    description: string;
    options: APIApplicationCommandOption[];
  };
  readonly exec: (interaction: CommandInteraction) => Promise<void>
}
