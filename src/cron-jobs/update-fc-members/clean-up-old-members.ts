import type { XIVFreeCompanyMemberListEntry } from '../../lib/nodestone/index.js';
import dataSource from '../../data-source.js';
import { Character } from '../../entities/index.js';
import { CoTAPIId } from '../../consts.js';
import { In, Not, IsNull, Brackets } from 'typeorm';
import { getNodestoneCharacter, getNodestoneFreecompany } from '../../lib/nodestone/index.js';
const charRepo = dataSource.getRepository<Character>(Character);

const updateNonMembers = async (memberList: XIVFreeCompanyMemberListEntry[]): Promise<void> => {
  const apiIdList = memberList.map((member) => member.ID.toString());
  const previousMembers = await charRepo.findBy({ free_company_id: CoTAPIId, apiId: Not(In(apiIdList)) });
  for (const previousMember of previousMembers) {
    let newFCId: null | string = null;
    if (previousMember.apiId) {
      const { FreeCompany: freeCompany } = await getNodestoneCharacter({ apiId: previousMember.apiId });
      if (freeCompany && freeCompany.ID) {
        newFCId = freeCompany.ID;
      }
    }
    await charRepo.update(previousMember.id, {
      free_company_id: newFCId,
      free_company_name: null,
    });
  }

  const missingFCNames = await charRepo
    .createQueryBuilder()
    .where({ free_company_id: Not(IsNull()) })
    .andWhere(
      new Brackets((qb) => {
        qb.where({ free_company_name: '' }).orWhere({ free_company_name: IsNull() });
      }),
    )
    .getMany();

  for (const missingFCName of missingFCNames) {
    if (missingFCName.free_company_id) {
      const { Name } = await getNodestoneFreecompany(missingFCName.free_company_id);
      await charRepo.update(missingFCName.id, {
        free_company_name: Name,
      });
    }
  }
};

export default updateNonMembers;
