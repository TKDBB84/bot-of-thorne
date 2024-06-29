import 'reflect-metadata';
import { Events, Client, GatewayIntentBits, IntentsBitField, Interaction } from 'discord.js';
import allCommands from './slash-commands/index.js';
import { GuildIds } from './consts.js';
import logger from './logger.js';
import { User } from './entities/index.js';
import { Cron } from 'croner';
import allCronJobs from './cron-jobs/index.js';
import registerSlashCommands from './lib/register-slash-commands/index.js';

export interface BotCronJob {
  cronTime: string;
  exec: (discordClient: Client) => void | Promise<void>;
}

const { BOT_CLIENT_ID: DISCORD_CLIENT_ID, BOT_CLIENT_SECRET: DISCORD_TOKEN } = process.env;
if (!DISCORD_CLIENT_ID || !DISCORD_TOKEN) {
  throw new Error('MISSING REQUIRED ENV VARIABLES');
}
logger.info('Starting Bot...');

const allIntents = new IntentsBitField([
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildModeration,
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
  // GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildScheduledEvents,
  GatewayIntentBits.AutoModerationConfiguration,
  GatewayIntentBits.AutoModerationExecution,
  GatewayIntentBits.GuildMessagePolls,
  GatewayIntentBits.DirectMessagePolls,
]);

const discordClient = new Client({ intents: allIntents });

void discordClient.login(DISCORD_TOKEN);
logger.info('login queued...');

discordClient.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;

  const command = allCommands.find(
    (_command) => _command.command.trim().toLowerCase() === interaction.commandName.trim().toLowerCase(),
  );

  if (command) {
    if (interaction.isAutocomplete()) {
      await command.autocomplete(interaction);
    } else if (interaction.isChatInputCommand()) {
      await command.exec(interaction);
    }
  }
});

discordClient.on('guildMemberAdd', (member) => {
  if (member.guild.id !== GuildIds.COT_GUILD_ID) {
    return;
  }
  void User.touch(member.id);
});

discordClient.on(Events.ClientReady, (readyClient) => {
  logger.info('client ready...');
  void start(readyClient)
    .then(() => {
      logger.info('Bot Started');
    })
    .catch((e) => {
      logger.error('Error Starting Bot', e);
      throw e;
    });
});

const start = async (readyClient: Client<true>) => {
  logger.debug('!!!Starting Bot...');
  const uniqueCommandNames = new Set<string>();
  allCommands.forEach(({ command }) => {
    uniqueCommandNames.add(command);
  });
  if (uniqueCommandNames.size !== allCommands.length) {
    throw new Error('Duplicate Command Names Are Not Supported');
  }

  logger.debug('Registering Slash Commands...');
  await registerSlashCommands();
  logger.debug('Logging Into Discord...');

  logger.debug('Scheduling CronJobs...');
  allCronJobs.forEach((job) => {
    new Cron(
      job.cronTime,
      {
        timezone: 'America/New_York',
      },
      job.exec.bind(job, readyClient),
    );
  });
};
