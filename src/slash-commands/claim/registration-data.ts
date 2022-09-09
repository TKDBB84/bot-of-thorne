import { SlashCommandBuilder, SlashCommandStringOption } from 'discord.js';
import type { SlashCommandRegistration } from '../types.js';

const commandName = 'claim';

const registrationData: SlashCommandRegistration = {
  readyToRegister: false,
  scope: 'COT',
  registrationData: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription('Links Your Discord Account To A Character')
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName('character_name').setDescription('FFXIV Character').setAutocomplete(true).setRequired(true),
    )
    .toJSON(),
};

export default registrationData;
