import { CommandInteraction } from 'discord.js';
import SlashCommand from './SlashCommand';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CoTAPIId, GuildIds } from '../consts';
import { getRepository } from 'typeorm';
import { SbUser, FFXIVChar } from '../entities';
import moment from 'moment';
import XIVApi from '@xivapi/js';

const getNumberOFDays = ({ firstSeenApi }: { firstSeenApi: string | Date | moment.Moment }): number => {
  const firstSeen = moment(firstSeenApi);
  const firstPull = moment(new Date(2019, 9, 11, 23, 59, 59));
  const beginningOfTime = moment(new Date(2019, 8, 2, 23, 59, 59));

  if (firstSeen.isBefore(beginningOfTime)) {
    return moment().diff(beginningOfTime, 'd');
  } else if (firstSeen.isAfter(beginningOfTime) && firstSeen.isBefore(firstPull)) {
    return moment().diff(beginningOfTime, 'd');
  } else {
    return moment().diff(firstSeen, 'd');
  }
};

export default class DaysCommand extends SlashCommand {
  public static readonly command = 'days';
  public static readonly commandRegistrationData = new SlashCommandBuilder()
    .setName(DaysCommand.command)
    .setDescription("Returns the approximate number of days you've been in the FC")
    .addStringOption((option) =>
      option.setName('CharacterName').setDescription('Full FFXIV Character Name').setRequired(true),
    )
    .toJSON();

  public static async exec(interaction: CommandInteraction): Promise<void> {
    const { XIV_API_TOKEN } = process.env;
    if (!interaction.inGuild() || interaction.guildId !== GuildIds.COT_GUILD_ID) {
      return;
    }
    const sbUserRepo = getRepository(SbUser);
    const characterRepo = getRepository(FFXIVChar);

    const discordId = interaction.member.user.id;
    const charName = interaction.options.getString('CharacterName', false);
    let sbUser = await sbUserRepo.findOne(discordId);
    if (!sbUser) {
      sbUser = new SbUser();
      sbUser.discordUserId = discordId;
      await sbUserRepo.save(sbUser);
    }
    if (!charName) {
      // try using claimed character
      let char = await characterRepo.findOne({ where: { user: { discordUserId: sbUser.discordUserId } } });
      if (!char) {
        await interaction.reply({
          content:
            "Sorry It doesnt look like you've claimed a character, you can use the claim command to do that, or provide a character name",
        });
        return;
      }
      if (!char.firstSeenApi) {
        await interaction.reply({
          content: `Sorry I have no record of ${char.name} in the FC`,
        });
        return;
      }
      const numDays = getNumberOFDays(char);
      await interaction.reply({
        content: `${char.name} has been in the FC for approximately ${numDays} days`,
      });
      return;
    }
    let char = await characterRepo
      .createQueryBuilder()
      .where(`LOWER(name) = LOWER(:name)`, { name: charName.trim().toLowerCase() })
      .getOne();
    if (!char) {
      char = characterRepo.create();
      char.name = charName.trim();
      char.user = sbUser;
      await characterRepo.save(char);
    }

    if (!char.firstSeenApi) {
      // lets check the API first
      const xivClient = new XIVApi({ private_key: XIV_API_TOKEN, language: 'en' });
      let matchingMember: XivApiCharacterSearchResult | undefined;
      if (!char.apiId) {
        const { FreeCompanyMembers } = xivClient.freecompany.get(CoTAPIId, { data: 'FCM' });
        matchingMember = FreeCompanyMembers.find(
          (member) => member.Name.trim().toLowerCase() === charName.trim().toLowerCase(),
        );
      } else {
        const { FreeCompany = null, Character = null } = xivClient.character.get(char.apiId.toString(), { data: 'FC' });
        if (FreeCompany && FreeCompany.Name.trim().toLowerCase() === 'Crowne of Thorne' && Character) {
          matchingMember = Character;
        }
      }
      if (!matchingMember) {
        await interaction.reply({
          content: `Sorry I have no record of ${char.name} in the FC`,
        });
        return;
      } else {
        char.firstSeenApi = new Date();
        char.apiId = +matchingMember.ID;
        char.name = matchingMember.Name.trim();
        await characterRepo.save(char);
      }
    }
    const numDays = getNumberOFDays(char);
    await interaction.reply({
      content: `${char.name} has been in the FC for approximately ${numDays} days`,
    });
    return;
  }
}
