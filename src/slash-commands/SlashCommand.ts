import { CommandInteraction } from 'discord.js';
import { APIApplicationCommandOption } from 'discord-api-types';

export default abstract class SlashCommand {
  public static readonly command: string;
  public static readonly commandRegistrationData: {
    name: string;
    description: string;
    options: APIApplicationCommandOption[];
  };
  public static exec(interaction: CommandInteraction): Promise<void> {
    const jsonValue = interaction.toJSON();
    if (typeof jsonValue === 'string') {
      throw new Error(`not implemented! ${jsonValue}`);
    }
    throw new Error('not implemented!');
  }
}
