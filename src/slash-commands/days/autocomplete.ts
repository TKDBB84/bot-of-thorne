import type { AutocompleteInteraction } from 'discord.js';
import {  User } from '../../entities/index.js';
import getCachedMemberList from '../../lib/get-cached-member-list.js';

const autocomplete = async (interaction: AutocompleteInteraction): Promise<void> => {
  User.touchInBackground(interaction.user.id);

  const partialCharName = interaction.options.getFocused();
  const choices = await getCachedMemberList(partialCharName);
  await interaction.respond(choices);

};

export default autocomplete;
