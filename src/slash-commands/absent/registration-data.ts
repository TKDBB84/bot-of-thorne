import { SlashCommandBuilder, SlashCommandStringOption } from 'discord.js';
import type { SlashCommandRegistration } from '../types.js';

const commandName = 'absent';
const registrationData: SlashCommandRegistration = {
  readyToRegister: true,
  scope: 'COT',
  registrationData: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription('Register an absences')
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName('character_name').setDescription('FFXIV Character').setAutocomplete(true).setRequired(true),
    )
    .toJSON(),
};

export default registrationData;
