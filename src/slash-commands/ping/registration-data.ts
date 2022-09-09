import { SlashCommandBuilder } from 'discord.js';
import type { SlashCommandRegistration } from '../types.js';

const commandName = 'ping';
const registrationData: SlashCommandRegistration = {
  readyToRegister: true,
  scope: 'ALL',
  registrationData: new SlashCommandBuilder()
    .setName(commandName)
    .setDescription('Replies with "pong" if bot is active')
    .toJSON(),
};

export default registrationData;
