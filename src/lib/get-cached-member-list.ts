import redisClient from '../redisClient.js';
import { Like } from 'typeorm';
import { CoTAPIId, ONE_HOUR_IN_SECONDS } from '../consts.js';
import dataSource from '../data-source.js';
import { Character } from '../entities/index.js';
import { CACHE_KEYS } from '../consts.js';

export type AutocompleteCharacterList = Array<{
  name: string;
  value: string;
}>;

const characterRepo = dataSource.getRepository(Character);

async function getCachedMemberList(partialName = ''): Promise<AutocompleteCharacterList> {
  const nameSearch = `${partialName}%`;
  const cacheKey = `${CACHE_KEYS.AUTO_COMPLETE.FC_MEMBER.SEARCH}:${nameSearch}`;

  try {
    const charListString = await redisClient.get(cacheKey);
    if (charListString) {
      const charList = JSON.parse(charListString) as Array<{ name: string; value: string }>;
      if (charList?.length) {
        return charList;
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
  if (choices.length) {
    void redisClient.set(cacheKey, JSON.stringify(choices), 'EX', ONE_HOUR_IN_SECONDS);
  }

  return choices;
}

export default getCachedMemberList;
