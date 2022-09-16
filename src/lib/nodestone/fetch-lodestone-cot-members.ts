import type { XIVFreeCompanyMemberListEntry, XIVFreeCompanyResponseWithMembers } from './types.js';
import nodeStoneRequest from './request.js';
import { CoTAPIId } from '../../consts.js';
import { setTimeout } from 'node:timers/promises';

const fetchLodestoneCotMembers = async (
  page = 1,
  members: XIVFreeCompanyMemberListEntry[] = [],
): Promise<XIVFreeCompanyMemberListEntry[]> => {
  if (!page) {
    return members;
  }
  const {
    data: { FreeCompanyMembers },
  } = await nodeStoneRequest.get<XIVFreeCompanyResponseWithMembers>(`/freecompany/${CoTAPIId}`, {
    params: { data: 'FCM', Page: page },
  });

  await setTimeout(15000);
  return fetchLodestoneCotMembers(FreeCompanyMembers.Pagination.PageNext, members.concat(FreeCompanyMembers.List));
};

export default fetchLodestoneCotMembers;
