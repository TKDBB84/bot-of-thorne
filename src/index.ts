import 'reflect-metadata';
import { Client, Intents, Interaction } from 'discord.js';
import { Connection, createConnection } from 'typeorm';
import { REST } from '@discordjs/rest';
import { APIApplicationCommandOption, Routes } from 'discord-api-types/v9';
import { GuildIds, noop } from './consts';
import { commandForGlobal, commandsForCoT, commandsForTesting } from './slash-commands';

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

const commandsRegistered: { global: string[]; test: string[]; CoT: string[] } = { global: ['ping'], test: [], CoT: [] };

const toRegisterGlobal: {
  name: string;
  description: string;
  options: APIApplicationCommandOption[];
}[] = [];
commandForGlobal.forEach((slashCommand) => {
  if (!commandsRegistered.global.includes(slashCommand.command)) {
    toRegisterGlobal.push(slashCommand.commandRegistrationData);
  }
});

const toRegisterForTest: {
  name: string;
  description: string;
  options: APIApplicationCommandOption[];
}[] = [];
commandsForTesting.forEach((slashCommand) => {
  if (!commandsRegistered.test.includes(slashCommand.command)) {
    toRegisterForTest.push(slashCommand.commandRegistrationData);
  }
});
const toRegisterForCoT: {
  name: string;
  description: string;
  options: APIApplicationCommandOption[];
}[] = [];
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
  switch (interaction.commandName.toLowerCase().trim()) {
  case 'ping':
    await interaction.reply({ content: 'Pong!', ephemeral: true });
    break;
  default:
    return;
  }
});

const start = async () => {
  if (toRegisterGlobal.length) {
    void (await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: toRegisterGlobal }));
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
  void (await dbConnection);
  void (await discordClient.login(DISCORD_TOKEN));
};

void start().then(noop).catch(console.error);
