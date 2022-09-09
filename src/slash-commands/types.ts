import type { AutocompleteInteraction, CommandInteraction } from 'discord.js';
import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';

export declare type Scope = 'STS' | 'COT' | 'ALL';

export declare type SlashCommandRegistration = {
  readonly scope: Scope;
  readonly registrationData: RESTPostAPIApplicationCommandsJSONBody;
  readonly readyToRegister: boolean;
};

export declare interface SlashCommandCallback {
  readonly command: string;
  readonly autocomplete: (interaction: AutocompleteInteraction) => Promise<void>;
  readonly exec: (interaction: CommandInteraction) => Promise<void>;
}
