import { CommandInteraction } from 'discord.js';
import SlashCommand from './SlashCommand';
import { SlashCommandBuilder } from '@discordjs/builders';

export default class PingCommand extends SlashCommand {
  public static readonly command = 'days';
  public static readonly commandRegistrationData = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with "pong" if bot is active')
    .toJSON();

  public static async exec(interaction: CommandInteraction): Promise<void> {
    await interaction.reply({ content: 'Pong!', ephemeral: true });
  }
}
