import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { SlashCommand } from './SlashCommand';

const PingCommand: SlashCommand = {
  command: 'ping',
  commandRegistrationData: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with "pong" if bot is active')
    .toJSON(),

  async exec(interaction: CommandInteraction): Promise<void> {
    await interaction.reply({ content: 'Pong!', ephemeral: true });
  },
};

export default PingCommand;
