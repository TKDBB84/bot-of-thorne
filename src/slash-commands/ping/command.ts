import type { CommandInteraction } from 'discord.js';
import type { SlashCommandCallback } from '../types.js';
import registrationData from './registration-data.js';

const command: SlashCommandCallback = {
  command: registrationData.registrationData.name,
  async autocomplete() {},
  async exec(interaction: CommandInteraction): Promise<void> {
    await interaction.reply({ content: 'Pong!', ephemeral: true });
  },
};

export default command;
