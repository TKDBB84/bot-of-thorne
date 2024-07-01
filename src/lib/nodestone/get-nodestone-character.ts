import type { XIVCharacter, SearchByNameParam, SearchByIdParam } from './types.js';
import redisClient from '../../redisClient.js';
import { ONE_HOUR_IN_SECONDS } from '../../consts.js';
import fetchLodestoneCharacter from './fetch-lodestone-character.js';

function getNodestoneCharacter({ apiId }: SearchByIdParam): Promise<XIVCharacter>;
function getNodestoneCharacter({ name, exactMatch }: SearchByNameParam): Promise<XIVCharacter[]>;

async function getNodestoneCharacter({ apiId = '', name = '', exactMatch = true }) {
  if (apiId) {
    const lodestoneCharacterCacheKey = `Nodestone:CharacterData:${apiId}`;
    try {
      const charDataString = await redisClient.get(lodestoneCharacterCacheKey);
      if (charDataString) {
        return JSON.parse(charDataString) as XIVCharacter;
      }
    } catch {
      // do nothing and pull fresh data
    }
    const character = await fetchLodestoneCharacter({ apiId });
    if (character) {
      void redisClient.set(lodestoneCharacterCacheKey, JSON.stringify(character), 'EX', ONE_HOUR_IN_SECONDS * 3);
    }
    return character;
  }
  if (name) {
    const lodestoneCharacterCacheKey = `Nodestone:CharacterList:Name:${name}`;
    try {
      const charDataString = await redisClient.get(lodestoneCharacterCacheKey);
      if (charDataString) {
        return JSON.parse(charDataString) as XIVCharacter[];
      }
    } catch {
      // do nothing and pull fresh data
    }
    const character = await fetchLodestoneCharacter({ name, exactMatch });
    if (character.length) {
      void redisClient.set(lodestoneCharacterCacheKey, JSON.stringify(character), 'EX', ONE_HOUR_IN_SECONDS * 3);
    }
    return character;
  }
  throw new Error('Not Sure How You Got Here');
}

export default getNodestoneCharacter;
