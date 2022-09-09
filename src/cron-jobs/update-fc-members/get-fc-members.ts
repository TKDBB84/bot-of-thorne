import type { XIVFreeCompanyMemberListEntry } from '../../lib/nodestone/index.js';
import { ONE_HOUR_IN_SECONDS } from '../../consts.js';
import redisClient from '../../redisClient.js';
import fetchLodestoneCotMembers from '../../lib/nodestone/fetch-lodestone-cot-members.js';

const getLodestoneMembers: (forcePull?: boolean) => Promise<XIVFreeCompanyMemberListEntry[]> = async (
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
  const freshMemberList = await fetchLodestoneCotMembers();
  void redisClient.set(redisMemberListKey, JSON.stringify(freshMemberList), 'EX', ONE_HOUR_IN_SECONDS * 6);
  return freshMemberList;
};

export default getLodestoneMembers;
