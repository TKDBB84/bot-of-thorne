import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommandRegistration } from '../types.js';

const commandName = 'promote';
const registrationData: SlashCommandRegistration = {
  readyToRegister: false,
  scope: 'COT',
  registrationData: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription('Requests a promotion from CoT Officers')
    .toJSON(),
};

export default registrationData;
