import type { XIVCharacter, XIVCharacterResponse } from './types.js';
import axios from 'axios';

const fetchLodestoneCharacter = async (apiId: string): Promise<XIVCharacter> => {
  const { data } = await axios.get<XIVCharacterResponse>(`http://localhost:8080/character/${apiId}`, {
    params: { data: 'FC' },
  });
  return data.Character;
};

export default fetchLodestoneCharacter;
