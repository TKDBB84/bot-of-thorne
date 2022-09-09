import type { SlashCommandCallback } from '../types.js';
import commandRegistrationData from './registration-data.js';
import dataSource from '../../data-source.js';
import { Character, User } from '../../entities/index.js';
import type { AutocompleteInteraction, ChatInputCommandInteraction } from 'discord.js';
import { CoTAPIId, GuildIds } from '../../consts.js';
import { getLodestoneCharacter, getLodestoneFreecompany, XIVFreeCompany } from '../../lib/nodestone/index.js';

const characterRepo = dataSource.getRepository(Character);

const command: SlashCommandCallback = {
  command: commandRegistrationData.registrationData.name,
  async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const searchName = interaction.options.getFocused();
    const characterList = await getLodestoneCharacter({ name: searchName, exactMatch: false });
    const choices = characterList.map((char) => ({ name: char.Name, value: char.ID.toString() }));
    await interaction.respond(choices);
  },
  async exec(interaction: ChatInputCommandInteraction): Promise<void> {
    if (
      !interaction.inGuild() ||
      (interaction.guildId !== GuildIds.COT_GUILD_ID && interaction.guildId !== GuildIds.SASNERS_TEST_SERVER_GUILD_ID)
    ) {
      return;
    }

    const discordId = interaction.member.user.id;
    const providedCharacter = interaction.options.get('character_name');
    if (!providedCharacter || !providedCharacter.value) {
      return;
    }
    const user = await User.touch(discordId);
    const apiId = providedCharacter.value.toString();
    const [dbCharacter, apiCharacter] = await Promise.all([
      characterRepo.findOneBy({ apiId }),
      getLodestoneCharacter({ apiId }),
    ]);
    let fcData: XIVFreeCompany | null = null;
    if (apiCharacter && apiCharacter.FreeCompany) {
      fcData = await getLodestoneFreecompany(apiCharacter.FreeCompany.ID);
    }
    let localCharacter: Character;
    if (!dbCharacter) {
      if (!apiCharacter) {
        await interaction.reply('Sorry, I cannot find a character in the lodestone with that name.');
        return;
      }
      localCharacter = await characterRepo.save(
        characterRepo.create({
          name: apiCharacter.Name,
          apiId: apiCharacter.ID.toString(),
          avatar: apiCharacter.Avatar,
          portrait: apiCharacter.Portrait,
          free_company_id: fcData ? fcData.ID : null,
          free_company_name: fcData ? fcData.Name : null,
          first_seen_in_fc: fcData?.ID === CoTAPIId ? new Date() : null,
          last_seen_in_fc: fcData?.ID === CoTAPIId ? new Date() : null,
          user,
        }),
      );
    } else {
      if (dbCharacter.user && dbCharacter.user.id !== discordId) {
        await interaction.reply('Sorry, Someone has already Claimed that character');
        return;
      }
      if (apiCharacter) {
        await characterRepo.update(dbCharacter.id, {
          name: apiCharacter.Name,
          user,
          last_seen_in_fc: fcData?.ID === CoTAPIId ? new Date() : dbCharacter.last_seen_in_fc,
          avatar: apiCharacter.Avatar,
          portrait: apiCharacter.Portrait,
        });
      }
      localCharacter = await characterRepo.findOneByOrFail({ id: dbCharacter.id });
    }

    await interaction.reply(`You have claimed ${localCharacter.name}`);
  },
};

export default command;
