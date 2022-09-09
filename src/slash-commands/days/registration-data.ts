import { SlashCommandBuilder, SlashCommandStringOption } from 'discord.js';
import type { SlashCommandRegistration } from '../types.js';

const commandName = 'days';

const registrationData: SlashCommandRegistration = {
  readyToRegister: false,
  scope: 'COT',
  registrationData: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription("Returns the approximate number of days you've been in the FC")
    .addStringOption((option: SlashCommandStringOption) =>
      option.setName('character_name').setDescription('FFXIV Character').setAutocomplete(true).setRequired(true),
    )
    .toJSON(),
};

export default registrationData;
