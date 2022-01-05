import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { SlashCommand } from './SlashCommand';

const command = 'ping';
const commandRegistrationData = new SlashCommandBuilder()
  .setName(command)
  .setDescription('Replies with "pong" if bot is active')
  .toJSON();

const PingCommand: SlashCommand = {
  command,
  commandRegistrationData,

  async exec(interaction: CommandInteraction): Promise<void> {
    await interaction.reply({ content: 'Pong!', ephemeral: true });
  },
};

export default PingCommand;
