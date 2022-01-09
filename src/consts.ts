import type { SlashCommand } from './slash-commands';
import type { Interaction } from 'discord.js';

export const enum GuildIds {
  COT_GUILD_ID = '324682549206974473',
  GAMEZZZ_GUILD_ID = '177596952836440065',
  SASNERS_TEST_SERVER_GUILD_ID = '367724585019506688',
}

export const NewUserChannels = {
  [GuildIds.COT_GUILD_ID]: '601971412000833556',
  [GuildIds.GAMEZZZ_GUILD_ID]: 'xx',
  [GuildIds.SASNERS_TEST_SERVER_GUILD_ID]: 'xx',
};
export const ONE_HOUR = 3600000;
export const CoTOfficerChannelId = '331196148079394836';
export const CoTButtStuffChannelId = '331786517041119233';
export const CoTPromotionChannelId = '362037806178238464';
export const CoTAPIId = '9229001536389012456';
export const PodcastRoleId = '784239695771992065';
export const SassybotLogChannelId = '848648942740963338';

export const enum UserIds {
  BRIGIE = '189195422114381824',
  CAIT = '131144696574640128',
  EITRI = '106004012347695104',
  HALLY = '158533023736791041',
  KRAYSAN = '177926353373364224',
  NYM = '98075883549519872',
  ONI = '181267070111973376',
  REX = '159868064228179968',
  RINBO = '111889910608183296',
  RYK = '136276996261937152',
  SASNER = '107435240686931968',
  SASSYBOT = '402131531268882432',
  URIKO = '157324426076094474',
  VERIAN = '159756239016820736',
  YOAKE = '215882287693299713',
  LEV = '124854733096615937',
  VERA = '210082031282028554',
  SASTRA = '293238959449047041',
  PAS = '85871040374259712',
  TYR = '168183160708923392',
}

export enum CotRanks {
  DIGNITARY = '331193662748885013',
  GUEST = '377254599041613836',
  MEMBER = '600338911755239424',
  NEW = '640992255506776124',
  OFFICER = '331191333672845312',
  RECRUIT = '601963080137703424',
  VETERAN = '600338562298413076',
  OTHER = '999999999999999999',
}

export enum CoTRankValueToString {
  '331193662748885013' = 'Dignitary',
  '377254599041613836' = 'Guest',
  '600338911755239424' = 'Member',
  '640992255506776124' = 'New',
  '331191333672845312' = 'Officer',
  '601963080137703424' = 'Recruit',
  '600338562298413076' = 'Veteran',
  '999999999999999999' = 'Other',
}

export const CoTRankStringToValue = {
  DIGNITARY: '331193662748885013',
  GUEST: '377254599041613836',
  MEMBER: '600338911755239424',
  NEW: '640992255506776124',
  OFFICER: '331191333672845312',
  OTHER: '999999999999999999',
  RECRUIT: '601963080137703424',
  VETERAN: '600338562298413076',
};

export const QUOTE_REACTIONS = {
  [GuildIds.COT_GUILD_ID]: '<:quote:543243777591083026>',
  [GuildIds.GAMEZZZ_GUILD_ID]: '<:quote:402946019517661184>',
  [GuildIds.SASNERS_TEST_SERVER_GUILD_ID]: '<:quote:543243777591083026>',
};

export enum EVENT_REPEATING_TYPE {
  NONE,
  DAILY,
  WEEKLY,
  BIWEEKLY,
  MONTHLY,
}

export const affirmativeResponses = ['yes', 'y', 'yup', 'sure', 'ye', 'yeah', 'si', 'yah', 'yea', 'yi', 'ye'];

export const noop: () => void = () => {
  // do nothing
};

export const matchInteraction: (interaction: Interaction) => (command: SlashCommand) => boolean =
  (interaction) => (command) =>
    interaction.isCommand() && command.command.trim().toLowerCase() === interaction.commandName.trim().toLowerCase();

export const CRON_SCHEDULE = {
  TWICE_DAILY: '0 15 8,20 * * *',
  DAILY: '0 0 20 * * *',
  AFTER_TWICE_DAILY: '0 30 8,20 * * *',
  EVERY_THREE_HOURS: '0 */3 * * *',
};
