import type { ChatInputCommandInteraction, Snowflake } from 'discord.js';
import { GuildIds } from '../consts.js';

const SUPPORTED_GUILD_IDS = [GuildIds.COT_GUILD_ID as Snowflake, GuildIds.SASNERS_TEST_SERVER_GUILD_ID as Snowflake];

function isSupportedGuildInteraction(
  interaction: ChatInputCommandInteraction,
): interaction is ChatInputCommandInteraction<'raw' | 'cached'> {
  return interaction.inGuild() && SUPPORTED_GUILD_IDS.includes(interaction.guildId);
}

export default isSupportedGuildInteraction;
