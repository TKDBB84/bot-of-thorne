import type { ChatInputCommandInteraction } from 'discord.js';
import type { SlashCommandCallback } from '../types.js';
import registrationData from './registration-data.js';
import { User } from '../../entities/index.js';

const command: SlashCommandCallback = {
  command: registrationData.registrationData.name,
  autocomplete: () => Promise.resolve(),
  async exec(interaction: ChatInputCommandInteraction): Promise<void> {
    User.touchInBackground(interaction.user.id);
    await interaction.reply({ content: 'Pong!', ephemeral: true });
  },
};

export default command;
