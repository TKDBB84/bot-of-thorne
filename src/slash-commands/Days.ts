import { CommandInteraction } from 'discord.js';
import { SlashCommand } from './SlashCommand';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CoTAPIId, GuildIds } from '../consts';
import { getRepository } from 'typeorm';
import { SbUser, FFXIVChar } from '../entities';
import XIVApi from '@xivapi/js';
import dayjs from 'dayjs';

const getNumberOFDays = ({ firstSeenApi }: { firstSeenApi: string | Date }): number => {
  const firstSeen = dayjs(firstSeenApi);
  const firstPull = dayjs(new Date(2019, 9, 11, 23, 59, 59));
  const beginningOfTime = dayjs(new Date(2019, 8, 2, 23, 59, 59));

  if (firstSeen.isBefore(beginningOfTime)) {
    return dayjs().diff(beginningOfTime, 'd');
  } else if (firstSeen.isAfter(beginningOfTime) && firstSeen.isBefore(firstPull)) {
    return dayjs().diff(beginningOfTime, 'd');
  } else {
    return dayjs().diff(firstSeen, 'd');
  }
};

const DaysCommand: SlashCommand = {
  command: 'days',
  commandRegistrationData: new SlashCommandBuilder()
    .setName('days')
    .setDescription("Returns the approximate number of days you've been in the FC")
    .addStringOption((option) =>
      option.setName('CharacterName').setDescription('Full FFXIV Character Name').setRequired(true),
    )
    .toJSON(),

  async exec(interaction: CommandInteraction): Promise<void> {
    const { XIV_API_TOKEN } = process.env;
    if (
      !interaction.inGuild() ||
      interaction.guildId === GuildIds.COT_GUILD_ID ||
      interaction.guildId === GuildIds.SASNERS_TEST_SERVER_GUILD_ID
    ) {
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
      const char = await characterRepo.findOne({ where: { user: { discordUserId: sbUser.discordUserId } } });
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
    const xivClient = new XIVApi({ private_key: XIV_API_TOKEN, language: 'en' });
    let matchingMember: XivApiCharacterSearchResult | undefined;
    let char = await characterRepo
      .createQueryBuilder()
      .where('LOWER(name) = LOWER(:name)', { name: charName.trim().toLowerCase() })
      .getOne();
    if (char && char.firstSeenApi) {
      const numDays = getNumberOFDays(char);
      await interaction.reply({
        content: `${char.name} has been in the FC for approximately ${numDays} days`,
      });
      return;
    }

    if (char && char.apiId) {
      const { FreeCompany = null, Character = null } = xivClient.character.get(char.apiId.toString(), { data: 'FC' });
      if (FreeCompany && FreeCompany.Name.trim().toLowerCase() === 'Crowne of Thorne' && Character) {
        matchingMember = Character;
      }
    }
    if (!char || !char.apiId) {
      const { FreeCompanyMembers } = xivClient.freecompany.get(CoTAPIId, { data: 'FCM' });
      matchingMember = FreeCompanyMembers.find(
        (member) => member.Name.trim().toLowerCase() === charName.trim().toLowerCase(),
      );
    }

    if (!matchingMember) {
      await interaction.reply({
        content: `Sorry I can't find a record of ${charName.trim()} in the FC through the lodestone.`,
      });
      return;
    }

    char = characterRepo.create();
    char.firstSeenApi = new Date();
    char.apiId = +matchingMember.ID;
    char.name = matchingMember.Name.trim();
    await characterRepo.save(char);
    await interaction.reply({
      content: `${char.name} has been in the FC for approximately less than 1 day`,
    });
    return;
  },
};

export default DaysCommand;
