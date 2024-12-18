import type { AutocompleteInteraction } from 'discord.js';
import { User } from '../../entities/index.js';
import getCachedMemberList from '../../lib/get-cached-member-list.js';
import isInteractionFromOfficer from '../../lib/is-message-from-officer.js';

const autocomplete = async (interaction: AutocompleteInteraction): Promise<void> => {
  User.touchInBackground(interaction.user.id);

  const partialCharName = interaction.options.getFocused();
  const [
    choices,
    isOfficer
  ] = await Promise.all([
    getCachedMemberList(partialCharName),
    isInteractionFromOfficer(interaction)
  ])

  if (isOfficer) {
    choices.push({
      name: 'view',
      value: '-1',
    })
  }

  await interaction.respond(choices);
};

export default autocomplete;
