import 'reflect-metadata';
import { Client, Intents, Interaction } from 'discord.js';
import { Connection, createConnection } from 'typeorm';
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

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
    entities: ['dist/entity/**/*.js', 'src/entity/**/*.ts'],
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

const pingSlashCommand = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with "pong" if bot is active');

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

rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: pingSlashCommand.toJSON() }).then(() => {
  dbConnection
    .then(async () => {
      await discordClient.login(DISCORD_TOKEN);
    })
    .catch((e) => {
      console.error('error connecting to database', e);
    });
});
