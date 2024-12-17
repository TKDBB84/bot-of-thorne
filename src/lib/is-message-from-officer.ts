import { CotRanks, GuildIds, AlwaysOfficers } from '../consts.js';
import { type ChatInputCommandInteraction, Role } from 'discord.js';


const isInteractionFromOfficer = async (interaction: ChatInputCommandInteraction): Promise<boolean> => {
  const { guildId, member, user: {id: userId} } = interaction

  if (AlwaysOfficers.includes(userId.toString())) {
    return true;
  }

  if (!guildId || !member  || guildId.toString() !== GuildIds.COT_GUILD_ID) {
    // we dont support direct messages: sorry
    return false
  }


  const cot = await interaction.client.guilds.fetch(GuildIds.COT_GUILD_ID)
  const officerRole = await cot.roles.fetch(CotRanks.OFFICER)
  if (!officerRole) {
    return false
  }


  const guildMember = await cot.members.fetch(userId)
  return guildMember.roles.highest.comparePositionTo(officerRole) >= 0
};

export default isInteractionFromOfficer;
