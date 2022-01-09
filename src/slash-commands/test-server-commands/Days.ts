import { CommandInteraction, MessageAttachment, MessageEmbed } from 'discord.js';
import { GuildSlashCommand } from '../SlashCommand';
import { SlashCommandBuilder, SlashCommandStringOption } from '@discordjs/builders';
import { CoTAPIId } from '../../consts';
import { getRepository } from 'typeorm';
import { SbUser, FFXIVChar } from '../../entities';
import CardCreator from 'xiv-character-cards';
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

const commandRegistrationData = new SlashCommandBuilder()
  .setName('days')
  .setDescription("Returns the approximate number of days you've been in the FC")
  .addStringOption((option: SlashCommandStringOption) =>
    option.setName('character_name').setDescription('Full FFXIV Character Name').setRequired(false),
  )
  .toJSON();

const getCharacterCard: (apiId: number) => Promise<Buffer> = async (apiId: number) => {
  const card = new CardCreator();
  await card.ensureInit();
  return card.createCard(apiId);
};

const replyWithDaysEmbed: (char: FFXIVChar, interaction: CommandInteraction) => Promise<void> = async (
  char: FFXIVChar,
  interaction: CommandInteraction,
) => {
  const numDays = getNumberOFDays(char);
  const embed = new MessageEmbed()
    .setAuthor({
      name: 'Crowne of Thorne Member',
      iconURL: 'https://cdn.discordapp.com/icons/324682549206974473/4085926e1a87a4b85a60709a952c1f18.png?size=128',
      url: 'https://na.finalfantasyxiv.com/lodestone/freecompany/9229001536389012456/',
    })
    .setTitle(char.name)
    .addFields({ name: 'Time In FC', value: `${numDays} days` });

  if (char.apiId) {
    await interaction.deferReply();
    let cardBuffer: Buffer | false;
    try {
      cardBuffer = await getCharacterCard(char.apiId);
    } catch (e) {
      cardBuffer = false;
    }
    if (cardBuffer) {
      const fileName = char.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const attachment = new MessageAttachment(cardBuffer, `${fileName}.png`);
      embed.setImage(`attachment://${fileName}.png`);
      embed.setURL(`https://na.finalfantasyxiv.com/lodestone/character/${char.apiId}/`);
      await interaction.editReply({ embeds: [embed], files: [attachment] });
      return;
    }
  }
  await interaction.reply({ embeds: [embed] });
};

const DaysCommand: GuildSlashCommand = {
  command: 'days',
  commandRegistrationData,

  async exec(interaction): Promise<void> {
    const { XIV_API_TOKEN } = process.env;

    const sbUserRepo = getRepository(SbUser);
    const characterRepo = getRepository(FFXIVChar);

    const discordId = interaction.member.user.id;
    const charName = interaction.options.getString('character_name', false);

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

    console.log({ foundChar: char });
    if (char && char.firstSeenApi) {
      await replyWithDaysEmbed(char, interaction);
      return;
    }

    if (char && char.apiId) {
      const { FreeCompany = null, Character = null } = xivClient.character.get(char.apiId.toString(), { data: 'FC' });
      if (FreeCompany && FreeCompany.Name.trim().toLowerCase() === 'Crowne of Thorne' && Character) {
        matchingMember = Character;
      }
    }
    if (!char || !char.apiId) {
      const { FreeCompanyMembers = [] } = xivClient.freecompany.get(CoTAPIId, { data: 'FCM' });
      console.log({ searchResults: FreeCompanyMembers });
      matchingMember = FreeCompanyMembers.find(
        (member) => member.Name.trim().toLowerCase() === charName.trim().toLowerCase(),
      );
    }

    console.log({ matchingMember });
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
    char = await characterRepo.save(char, { reload: true });
    await replyWithDaysEmbed(char, interaction);
    return;
  },
};

export default DaysCommand;
