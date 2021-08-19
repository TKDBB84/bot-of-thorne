import 'reflect-metadata';
import { Client, Intents, Interaction } from 'discord.js';
import { Connection, createConnection } from 'typeorm';
import { REST } from '@discordjs/rest';
import { APIApplicationCommandOption, Routes } from 'discord-api-types/v9';
import { noop } from './consts';
import slashCommands from './slash-commands';

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

const commandsRegistered = ['ping'];

const toRegister: {
  name: string;
  description: string;
  options: APIApplicationCommandOption[];
}[] = [];
slashCommands.forEach((slashCommand) => {
  if (!commandsRegistered.includes(slashCommand.command)) {
    toRegister.push(slashCommand.commandRegistrationData);
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
  if (toRegister.length) {
    void (await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: toRegister }));
  }
  void (await dbConnection);
  void (await discordClient.login(DISCORD_TOKEN));
};

void start().then(noop).catch(console.error);
