import type { SlashCommandCallback } from '../types.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import commandRegistrationData from './registration-data.js';
import dayjs from 'dayjs';
import dataSource from '../../data-source.js';
import { Character, User } from '../../entities/index.js';
import { CoTAPIId, GuildIds } from '../../consts.js';
import { Like } from 'typeorm';
import { getNodestoneCharacter, getNodestoneFreecompany } from '../../lib/nodestone/index.js';
import logger from '../../logger.js';
import autocomplete from './autocomplete.js';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere.js';
import isSupportedGuildInteraction from '../../lib/is-support-guild-interaction.js';

const characterRepo = dataSource.getRepository(Character);

const getNumberOFDays = ({ first_seen_in_fc }: { first_seen_in_fc: Date | null }): number => {
  const firstSeen = dayjs(first_seen_in_fc);
  const firstPull = dayjs(new Date(2019, 9, 11, 23, 59, 59));

  if (firstSeen.isBefore(firstPull)) {
    return dayjs().diff(firstPull, 'd') + 1;
  }
  return dayjs().diff(firstSeen, 'd') + 1;
};

const command: SlashCommandCallback = {
  command: commandRegistrationData.registrationData.name,
  autocomplete,
  async exec(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!isSupportedGuildInteraction(interaction)) {
      return;
    }

    User.touchInBackground(interaction.user.id);

    const providedCharacter = interaction.options.get('character_name');
    if (!providedCharacter || !providedCharacter.value) {
      return;
    }
    const characterId = providedCharacter.value as string | number;

    let charParams: FindOptionsWhere<Character> = { id: +characterId };
    if (!Number.isInteger(charParams.id)) {
      charParams = { name: Like(characterId.toString()) };
    }

    let character = await characterRepo.findOneBy(charParams);
    if (!character) {
      await interaction.deferReply();
      const characterList = await getNodestoneCharacter({ name: characterId.toString() });
      if (characterList.length === 0) {
        await interaction.editReply({
          content: `Sorry I cant find a record of ${characterId.toString()} in the FC nor on Jenova in the Lodestone`,
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
      const fcData = await getNodestoneFreecompany(character.free_company_id);
      await characterRepo.update(character.id, { free_company_name: fcData.Name });
      character.free_company_name = fcData.Name;
    }

    const replyFn = interaction.deferred
      ? interaction.editReply.bind(interaction)
      : interaction.reply.bind(interaction);
    let content: string;
    if (character.free_company_id === CoTAPIId) {
      content = `${character.name} has been in the FC for approximately ${getNumberOFDays(character)} days`;
    } else {
      content = `${character.name} appears to be a member of ${
        character.free_company_name ? character.free_company_name : 'No'
      } Free Company, I only track Crowne of Thorne Members.`;
    }
    await replyFn(content);
    return;
  },
};

export default command;
