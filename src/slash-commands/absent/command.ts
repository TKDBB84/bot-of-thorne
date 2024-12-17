import type { ChatInputCommandInteraction } from 'discord.js';
import type { SlashCommandCallback } from '../types.js';
import registrationData from './registration-data.js';
import { User } from '../../entities/index.js';
import isSupportedGuildInteraction from '../../lib/is-support-guild-interaction.js';
import autocomplete from './autocomplete.js';

const command: SlashCommandCallback = {
  command: registrationData.registrationData.name,
  autocomplete,
  async exec(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!isSupportedGuildInteraction(interaction)) {
      return;
    }
    User.touchInBackground(interaction.user.id);
    /// *do logic

    return;
  },
};

export default command;
