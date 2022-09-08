import type { CommandInteraction } from 'discord.js';
import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';

declare type Scope = 'STS' | 'COT' | 'ALL';

export declare interface SlashCommands {
  readonly readyToRegister: boolean;
  readonly scope: Scope;
  readonly command: string;
  readonly commandRegistrationData: RESTPostAPIApplicationCommandsJSONBody;
  readonly exec: (interaction: CommandInteraction) => Promise<void>;
}
