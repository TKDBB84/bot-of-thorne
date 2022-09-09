import type { BotCronJob } from '../../index.js';
import saveMembersToCharacters from './save-members-to-characters.js';
import updateNonMembers from './clean-up-old-members.js';
import { getLodestoneCotMembers } from '../../lib/nodestone/index.js';

const updateFCMembers: BotCronJob = {
  cronTime: '0 15 8,20 * * *',
  async exec() {
    const memberList = await getLodestoneCotMembers();
    await saveMembersToCharacters(memberList);
    await updateNonMembers(memberList);
  },
};

export default updateFCMembers;
