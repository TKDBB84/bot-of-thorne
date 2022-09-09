import type {
  SearchByIdParam,
  SearchByNameParam,
  XIVCharacter,
  XIVCharacterBase,
  XIVCharacterResponse,
  XIVCharacterSearchResponse,
} from './types.js';
import axios from 'axios';
import getLodestoneCharacter from './get-lodestone-character.js';

async function fetchCharacterListPages(
  name: string,
  page = 1,
  charList: XIVCharacterBase[] = [],
): Promise<XIVCharacterBase[]> {
  const { data } = await axios.get<XIVCharacterSearchResponse>(`http://localhost:8080/character/search`, {
    params: { name, server: 'Jenova', page },
  });
  charList.concat(data.List);
  if (data.Pagination.PageNext) {
    return fetchCharacterListPages(name, ++page, charList);
  }
  return charList;
}

function fetchLodestoneCharacter({ apiId }: SearchByIdParam): Promise<XIVCharacter>;
function fetchLodestoneCharacter({ name }: SearchByNameParam): Promise<XIVCharacter[]>;
async function fetchLodestoneCharacter({ apiId = '', name = '' }) {
  if (apiId) {
    const { data } = await axios.get<XIVCharacterResponse>(`http://localhost:8080/character/${apiId}`, {
      params: { data: 'FC' },
    });
    return data.Character;
  }
  if (name) {
    const charList = await fetchCharacterListPages(name);
    const nameExactMatch = charList.filter(
      (matchingChar) => matchingChar.Name.toLowerCase().trim() === name.toLowerCase().trim(),
    );
    return Promise.all(nameExactMatch.map(({ ID: _apiId }) => getLodestoneCharacter({ apiId: _apiId.toString() })));
  }
  throw new Error('How Did You Get Here?');
}

export default fetchLodestoneCharacter;
