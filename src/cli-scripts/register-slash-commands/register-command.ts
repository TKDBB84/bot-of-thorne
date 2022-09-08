import { Routes } from 'discord-api-types/v9';
import { GuildIds } from '../../consts.js';
import type { SlashCommands } from '../../slash-commands/index.js';
import { REST } from '@discordjs/rest';
import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';

const { DISCORD_CLIENT_ID, DISCORD_TOKEN } = process.env;
if (!DISCORD_CLIENT_ID || !DISCORD_TOKEN) {
  throw new Error('No Client ID Found');
}

const registerCommands = async (commands: SlashCommands[]): Promise<void> => {
  const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);

  const COTCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
  const STSCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
  const ALLCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];

  commands.forEach((command) => {
    switch (command.scope) {
      case 'COT':
        COTCommands.push(command.commandRegistrationData);
        break;
      case 'STS':
        STSCommands.push(command.commandRegistrationData);
        break;
      case 'ALL':
      default:
        ALLCommands.push(command.commandRegistrationData);
    }
  });

  if (COTCommands.length) {
    void (await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, GuildIds.COT_GUILD_ID), {
      body: COTCommands,
    }));
  }
  if (STSCommands.length) {
    void (await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, GuildIds.SASNERS_TEST_SERVER_GUILD_ID), {
      body: STSCommands,
    }));
  }
  if (ALLCommands.length) {
    void (await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), {
      body: ALLCommands,
    }));
  }
};

export default registerCommands;
