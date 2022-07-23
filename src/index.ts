import 'reflect-metadata';
import { Client, GatewayIntentBits, IntentsBitField, Interaction, InteractionType } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { GuildIds, noop } from './consts.js';
import allCommands, {
  commandsDataForGlobal,
  commandsDataForCoT,
  commandsDataForTesting,
} from './slash-commands/index.js';
import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import Redis from 'ioredis';
import logger from './logger.js';
import sassybotCommands from './sassybot-commands/index.js';

type SassybotEvent = SassybotDaysEvent;
type SassybotDaysEvent = {
  eventName: 'daysRequest';
  isOfficerQuery: boolean;
  numDays: number;
  charName: string;
  authorId: string;
  channelId: string;
  messageId: string;
};

const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;
if (!DISCORD_CLIENT_ID || !DISCORD_TOKEN) {
  throw new Error('MISSING REQUIRED ENV VARIABLES');
}

const allIntents = new IntentsBitField([
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildBans,
  GatewayIntentBits.GuildEmojisAndStickers,
  GatewayIntentBits.GuildIntegrations,
  GatewayIntentBits.GuildWebhooks,
  GatewayIntentBits.GuildInvites,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildPresences,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.GuildMessageTyping,
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.DirectMessageReactions,
  GatewayIntentBits.DirectMessageTyping,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildScheduledEvents,
]);
const commandsRegistered: { global: string[]; test: string[]; CoT: string[] } = {
  global: ['ping'],
  test: ['days'],
  CoT: [],
};

const toRegisterGlobal: RESTPostAPIApplicationCommandsJSONBody[] = [];
commandsDataForGlobal.forEach((slashCommand) => {
  if (!commandsRegistered.global.includes(slashCommand.command)) {
    toRegisterGlobal.push(slashCommand.commandRegistrationData);
  }
});

const toRegisterForTest: RESTPostAPIApplicationCommandsJSONBody[] = [];
commandsDataForTesting.forEach((slashCommand) => {
  if (!commandsRegistered.test.includes(slashCommand.command)) {
    toRegisterForTest.push(slashCommand.commandRegistrationData);
  }
});
const toRegisterForCoT: RESTPostAPIApplicationCommandsJSONBody[] = [];
commandsDataForCoT.forEach((slashCommand) => {
  if (!commandsRegistered.CoT.includes(slashCommand.command)) {
    toRegisterForCoT.push(slashCommand.commandRegistrationData);
  }
});

const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);
const discordClient = new Client({ intents: allIntents });
discordClient.on('interactionCreate', async (interaction: Interaction) => {
  if (interaction.type !== InteractionType.ApplicationCommand) {
    return;
  }

  const command = allCommands.find(
    (_command) => _command.command.trim().toLowerCase() === interaction.commandName.trim().toLowerCase(),
  );

  if (command) {
    await command.exec(interaction);
  }
});

// register sassybot listeners
const redisClient = new Redis();
await redisClient.subscribe('sassybot-events', (err) => {
  if (err) {
    logger.error('error subscribing to reids', err);
    throw err;
  }
  logger.debug('Subscribed to Sassybot Events');
});

redisClient.on('message', (channel: string, message: string) => {
  if (channel.toLowerCase() !== 'sassybot-events') {
    return;
  }
  let sentObject: SassybotEvent;
  try {
    sentObject = JSON.parse(message) as SassybotEvent;
  } catch (e: unknown) {
    logger.error('None JSON message From Sassybot', { message, error: e });
    return;
  }
  if (sentObject?.eventName) {
    const matchingCommand = sassybotCommands.find(
      (sassybotCommand) => sassybotCommand.eventName === sentObject.eventName,
    );
    if (matchingCommand) {
      void matchingCommand.exec(discordClient, sentObject);
    }
  }
});

const start = async () => {
  if (toRegisterGlobal.length) {
    void (await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), {
      body: toRegisterGlobal.map((command) => command),
    }));
  }
  if (toRegisterForCoT.length) {
    void (await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, GuildIds.COT_GUILD_ID), {
      body: toRegisterForCoT.map((command) => command),
    }));
  }
  if (toRegisterForTest.length) {
    void (await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, GuildIds.SASNERS_TEST_SERVER_GUILD_ID), {
      body: toRegisterForTest.map((command) => command),
    }));
  }
  void (await discordClient.login(DISCORD_TOKEN));
};

void start()
  .then(noop)
  .catch((e) => {
    logger.error('Error Starting Bot', e);
    throw e;
  });
