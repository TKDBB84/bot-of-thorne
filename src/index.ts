import 'reflect-metadata';
import { Client, Intents, Interaction } from 'discord.js';
import { Connection, createConnection } from 'typeorm';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { GuildIds, noop, matchInteraction } from './consts';
import { commandsForGlobal, commandsForCoT, commandsForTesting, SlashCommand } from './slash-commands';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types';
import cronJobs from './cron-jobs';
import nodeCron from 'node-cron';

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, NODE_ENV = 'development' } = process.env;
if (!DISCORD_CLIENT_ID || !DISCORD_TOKEN) {
  throw new Error('MISSING REQUIRED ENV VARIABLES');
}

const intents = new Intents();
intents.add(
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
  Intents.FLAGS.GUILD_PRESENCES,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Intents.FLAGS.DIRECT_MESSAGES,
  Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
);

let dbConnection: Promise<Connection>;
if (NODE_ENV !== 'production') {
  dbConnection = createConnection({
    database: 'sassybot',
    entities: ['dist/entities/**/*.js', 'src/entities/**/*.ts'],
    host: 'localhost',
    logging: true,
    password: 'sassy123',
    port: 3306,
    synchronize: false,
    type: 'mariadb',
    username: 'sassybot',
  });
} else {
  dbConnection = createConnection();
}

const commandsRegistered: { global: string[]; test: string[]; CoT: string[] } = {
  global: ['ping'],
  test: [],
  CoT: [],
};

const toRegisterGlobal: RESTPostAPIApplicationCommandsJSONBody[] = [];
commandsForGlobal.forEach((slashCommand) => {
  if (!commandsRegistered.global.includes(slashCommand.command)) {
    toRegisterGlobal.push(slashCommand.commandRegistrationData);
  }
});

const toRegisterForTest: RESTPostAPIApplicationCommandsJSONBody[] = [];
commandsForTesting.forEach((slashCommand) => {
  if (!commandsRegistered.test.includes(slashCommand.command)) {
    toRegisterForTest.push(slashCommand.commandRegistrationData);
  }
});
const toRegisterForCoT: RESTPostAPIApplicationCommandsJSONBody[] = [];
commandsForCoT.forEach((slashCommand) => {
  if (!commandsRegistered.CoT.includes(slashCommand.command)) {
    toRegisterForCoT.push(slashCommand.commandRegistrationData);
  }
});

const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);
const discordClient = new Client({ intents });
discordClient.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  let commandToExecute: SlashCommand | undefined;
  const findCommand = matchInteraction(interaction);
  if (interaction.inGuild()) {
    switch (interaction.guildId) {
      case GuildIds.SASNERS_TEST_SERVER_GUILD_ID:
        commandToExecute = commandsForTesting.find(findCommand);
        break;
      default:
      case GuildIds.COT_GUILD_ID:
        commandToExecute = commandsForCoT.find(findCommand);
        break;
    }
    if (commandToExecute) {
      await commandToExecute.exec(interaction);
    }
  } else {
    const globalCommand = commandsForGlobal.find(findCommand);
    if (globalCommand) {
      await globalCommand.exec(interaction);
    }
  }
});

const start = async () => {
  if (toRegisterGlobal.length) {
    void (await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), {
      body: toRegisterGlobal,
    }));
  }
  if (toRegisterForCoT.length) {
    void (await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, GuildIds.COT_GUILD_ID), {
      body: toRegisterForCoT,
    }));
  }
  if (toRegisterForTest.length) {
    void (await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, GuildIds.SASNERS_TEST_SERVER_GUILD_ID), {
      body: toRegisterForTest,
    }));
  }
  const connection = await dbConnection;
  void (await discordClient.login(DISCORD_TOKEN));

  cronJobs.forEach(({ schedule, exec }) => {
    nodeCron.schedule(schedule, () => {
      void exec(connection);
    });
  });
};

void start().then(noop).catch(console.error);
