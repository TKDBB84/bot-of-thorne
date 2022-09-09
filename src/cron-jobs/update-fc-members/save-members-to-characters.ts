import type { XIVFreeCompanyMemberListEntry } from '../../lib/nodestone/index.js';
import dataSource from '../../data-source.js';
import { Character } from '../../entities/index.js';
import { CoTAPIId } from '../../consts.js';

const saveMembersToCharacters: (memberList: XIVFreeCompanyMemberListEntry[]) => Promise<void> = async (
  memberList: XIVFreeCompanyMemberListEntry[],
) => {
  const charRepo = dataSource.getRepository<Character>(Character);
  for (const member of memberList) {
    const apiId = member.ID.toString();
    let matchingCharacter: null | Character = null;
    matchingCharacter = await charRepo.findOneBy({ apiId });
    if (!matchingCharacter) {
      matchingCharacter = await charRepo
        .createQueryBuilder()
        .where('LOWER(name) = LOWER(:name)')
        .setParameter('name', member.Name)
        .getOne();
    }
    if (!matchingCharacter) {
      matchingCharacter = charRepo.create({
        apiId,
        avatar: member.Avatar,
        free_company_id: CoTAPIId,
        free_company_name: 'Crowne of Thorne',
        name: member.Name,
        first_seen_in_fc: new Date(),
        last_seen_in_fc: new Date(),
      });
    }
    matchingCharacter.avatar = member.Avatar;
    matchingCharacter.last_seen_in_fc = new Date();
    matchingCharacter.name = member.Name;
    matchingCharacter.free_company_id = CoTAPIId;
    matchingCharacter.free_company_name = 'Crowne of Thorne';
    await charRepo.save(matchingCharacter);
  }
};

export default saveMembersToCharacters;
