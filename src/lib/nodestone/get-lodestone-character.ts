import type { XIVCharacter, SearchByNameParam, SearchByIdParam } from './types.js';
import redisClient from '../../redisClient.js';
import { ONE_HOUR_IN_SECONDS } from '../../consts.js';
import fetchLodestoneCharacter from './fetch-lodestone-character.js';

function getLodestoneCharacter({ apiId }: SearchByIdParam): Promise<XIVCharacter>;
function getLodestoneCharacter({ name }: SearchByNameParam): Promise<XIVCharacter[]>;

async function getLodestoneCharacter({ apiId = '', name = '' }) {
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
    void redisClient.set(lodestoneCharacterCacheKey, JSON.stringify(character), 'EX', ONE_HOUR_IN_SECONDS * 3);
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
    const character = await fetchLodestoneCharacter({ name });
    void redisClient.set(lodestoneCharacterCacheKey, JSON.stringify(character), 'EX', ONE_HOUR_IN_SECONDS * 3);
    return character;
  }
  throw new Error('Not Sure How You Got Here');
}

export default getLodestoneCharacter;
