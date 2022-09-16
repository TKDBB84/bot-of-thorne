import type {
  SearchByIdParam,
  SearchByNameParam,
  XIVCharacter,
  XIVCharacterBase,
  XIVCharacterResponse,
  XIVCharacterSearchResponse,
} from './types.js';
import nodeStoneRequest from './request.js';
import getLodestoneCharacter from './get-lodestone-character.js';

async function fetchCharacterListPages(
  name: string,
  page = 1,
  charList: XIVCharacterBase[] = [],
): Promise<XIVCharacterBase[]> {
  const { data } = await nodeStoneRequest.get<XIVCharacterSearchResponse>('/character/search', {
    params: { name, server: 'Jenova', Page: page },
  });
  if (data.Pagination.PageNext) {
    return fetchCharacterListPages(name, ++page, charList.concat(data.List));
  }
  return charList.concat(data.List);
}

function fetchLodestoneCharacter({ apiId }: SearchByIdParam): Promise<XIVCharacter>;
function fetchLodestoneCharacter({ name, exactMatch }: SearchByNameParam): Promise<XIVCharacter[]>;
async function fetchLodestoneCharacter({ apiId = '', name = '', exactMatch = true }) {
  if (apiId) {
    const { data } = await nodeStoneRequest.get<XIVCharacterResponse>(`/character/${apiId}`, {
      params: { data: 'FC' },
    });
    return data.Character;
  }
  if (name) {
    const charList = await fetchCharacterListPages(name);
    const nameExactMatch = charList.filter(
      (matchingChar) => !exactMatch || matchingChar.Name.toLowerCase().trim() === name.toLowerCase().trim(),
    );
    return Promise.all(nameExactMatch.map(({ ID: _apiId }) => getLodestoneCharacter({ apiId: _apiId.toString() })));
  }
  throw new Error('How Did You Get Here?');
}

export default fetchLodestoneCharacter;
