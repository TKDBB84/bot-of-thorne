import type { ChatInputCommandInteraction } from 'discord.js';
import type { SlashCommandCallback } from '../types.js';
import registrationData from './registration-data.js';
import autocomplete from './autocomplete.js';
import { CoTAPIId, GuildIds } from '../../consts.js';
import { Character, User } from '../../entities/index.js';
import { Like } from 'typeorm';
import { getLodestoneCharacter, getLodestoneFreecompany } from '../../lib/nodestone/index.js';
import logger from '../../logger.js';
import dataSource from '../../data-source.js';
const characterRepo = dataSource.getRepository(Character);

const command: SlashCommandCallback = {
  command: registrationData.registrationData.name,
  autocomplete,
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
    const characterId = providedCharacter.value;
    await User.touch(discordId);
    let character: Character | null;
    if (Number.isInteger(+characterId)) {
      character = await characterRepo.findOneBy({ id: +characterId });
    } else {
      character = await characterRepo.findOneBy({ name: Like(characterId.toString()) });
    }
    if (!character) {
      await interaction.deferReply();
      const characterList = await getLodestoneCharacter({ name: characterId.toString() });
      if (characterList.length === 0) {
        await interaction.editReply({
          content: `Sorry I have no record of ${characterId.toString()} in the FC nor on Jenova in the Lodestone`,
        });
        return;
      } else if (characterList.length === 1) {
        const foundChar = characterList[0];
        if (foundChar) {
          const isCot = foundChar.FreeCompany?.ID === CoTAPIId;
          character = await characterRepo.save(
            characterRepo.create({
              apiId: foundChar.ID.toString(),
              name: foundChar.Name,
              avatar: foundChar.Avatar,
              portrait: foundChar.Portrait,
              free_company_id: foundChar.FreeCompany?.ID || null,
              free_company_name: isCot ? 'Crowne of Thorne' : null,
              first_seen_in_fc: isCot ? new Date() : null,
              last_seen_in_fc: isCot ? new Date() : null,
              last_promotion: null,
            }),
          );
          if (isCot) {
            await interaction.editReply(
              `This is My First Time Seeing ${foundChar.Name} as a member of Crowne of Thorne, so today is ${foundChar.Name}'s 1st Day`,
            );
            return;
          }
          await interaction.editReply('I have');
        } else {
          logger.error('Found but not found?', { characterList, foundChar, characterId });
          throw new Error('Found but not found?');
        }
      } else {
        await interaction.editReply('Multiple Characters Match This Name On Jenova... somehow');
        return;
      }
    }

    if (character.free_company_id && !character.free_company_name) {
      if (!interaction.deferred) {
        await interaction.deferReply();
      }
      const fcData = await getLodestoneFreecompany(character.free_company_id);
      await characterRepo.update(character.id, { free_company_name: fcData.Name });
      character.free_company_name = fcData.Name;
    }

    const replyFn = interaction.deferred
      ? interaction.editReply.bind(interaction)
      : interaction.reply.bind(interaction);
    const content = 'something something';
    await replyFn(content);
    return;
  },
};

export default command;
