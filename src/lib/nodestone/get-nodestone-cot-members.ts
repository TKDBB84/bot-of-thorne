import type { XIVFreeCompanyMemberListEntry } from './types.js';
import { ONE_HOUR_IN_SECONDS } from '../../consts.js';
import redisClient from '../../redisClient.js';
import fetchNodestoneCotMembers from './fetch-nodestone-cot-members.js';

const getNodestoneCotMembers: (forcePull?: boolean) => Promise<XIVFreeCompanyMemberListEntry[]> = async (
  forcePull = false,
) => {
  const redisMemberListKey = 'Nodestone:COT:MemberList';
  if (!forcePull) {
    try {
      const memberListString = await redisClient.get(redisMemberListKey);
      if (memberListString) {
        return JSON.parse(memberListString) as XIVFreeCompanyMemberListEntry[];
      }
    } catch {
      /* do nothing, just pull a fresh list */
    }
  }
  const freshMemberList = await fetchNodestoneCotMembers();
  if (freshMemberList.length) {
    void redisClient.set(redisMemberListKey, JSON.stringify(freshMemberList), 'EX', ONE_HOUR_IN_SECONDS * 6);
  }
  return freshMemberList;
};

export default getNodestoneCotMembers;
