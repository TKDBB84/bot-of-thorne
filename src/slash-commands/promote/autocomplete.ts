import type { AutocompleteInteraction } from 'discord.js';
import { Like } from 'typeorm';
import dataSource from '../../data-source.js';
import { Character, User } from '../../entities/index.js';
import redisClient from '../../redisClient.js';
import { CoTAPIId, ONE_HOUR_IN_SECONDS } from '../../consts.js';

const characterRepo = dataSource.getRepository(Character);
const autocomplete = async (interaction: AutocompleteInteraction): Promise<void> => {
  await User.touch(interaction.user.id);
  const partialCharName = interaction.options.getFocused();
  const nameSearch = `${partialCharName}%`;
  const cacheKey = `Promote:Autocomplete:${nameSearch}`;
  try {
    const charListString = await redisClient.get(cacheKey);
    if (charListString) {
      const charList = JSON.parse(charListString) as Array<{ name: string; value: string }>;
      if (charList?.length) {
        await interaction.respond(charList);
        return;
      }
    }
  } catch {
    // do nothing
  }

  const allCharacter = await characterRepo
    .createQueryBuilder()
    .where({ name: Like(nameSearch) })
    .andWhere({ free_company_id: CoTAPIId })
    .orderBy('name', 'ASC')
    .limit(5)
    .getMany();
  const choices = allCharacter.map((char) => ({ name: char.name, value: char.id.toString() }));
  await interaction.respond(choices);
  if (choices.length) {
    void redisClient.set(cacheKey, JSON.stringify(choices), 'EX', ONE_HOUR_IN_SECONDS);
  }
};

export default autocomplete;
