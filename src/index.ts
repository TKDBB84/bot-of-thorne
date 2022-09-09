import 'reflect-metadata';
import { Client, GatewayIntentBits, IntentsBitField, Interaction } from 'discord.js';
import allCommands from './slash-commands/index.js';
import { GuildIds, noop } from './consts.js';
import redisClient from './redisClient.js';
import logger from './logger.js';
import sassybotCommands from './sassybot-commands/index.js';
import { User } from './entities/index.js';
import { Cron } from 'croner';
import allCronJobs from './cron-jobs/index.js';
import registerSlashCommands from './lib/register-slash-commands/index.js';

export interface BotCronJob {
  cronTime: string;
  exec: (discordClient: Client) => void | Promise<void>;
}

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

const discordClient = new Client({ intents: allIntents });
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

// register sassybot listeners
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
  const uniqueCommandNames = new Set<string>();
  allCommands.forEach(({ command }) => {
    uniqueCommandNames.add(command);
  });
  if (uniqueCommandNames.size !== allCommands.length) {
    throw new Error('Duplicate Command Names Are Not Supported');
  }

  void (await registerSlashCommands());
  void (await discordClient.login(DISCORD_TOKEN));

  allCronJobs.forEach((job) => {
    new Cron(
      job.cronTime,
      {
        timezone: 'America/New_York',
      },
      job.exec.bind(job, discordClient),
    );
  });
};

void start()
  .then(noop)
  .catch((e) => {
    logger.error('Error Starting Bot', e);
    throw e;
  });
