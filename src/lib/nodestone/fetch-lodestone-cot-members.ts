import type { XIVFreeCompanyMemberListEntry, XIVFreeCompanyResponseWithMembers } from './types.js';
import axios from 'axios';
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
  } = await axios.get<XIVFreeCompanyResponseWithMembers>(`http://localhost:8080/freecompany/${CoTAPIId}`, {
    params: { data: 'FCM', page },
  });

  await setTimeout(15000);
  return fetchLodestoneCotMembers(FreeCompanyMembers.Pagination.PageNext, members.concat(FreeCompanyMembers.List));
};

export default fetchLodestoneCotMembers;
