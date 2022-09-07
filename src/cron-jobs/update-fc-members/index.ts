import type { BotCronJob } from '../../index.js';
import getFcMembers from './get-fc-members.js';
import saveMembersToCharacters from './save-members-to-characters.js';
import updateNonMembers from './clean-up-old-members.js';

const updateFCMembers: BotCronJob = {
  cronTime: '0 15 8,20 * * *',
  async exec() {
    const memberList = await getFcMembers();
    await saveMembersToCharacters(memberList);
    await updateNonMembers(memberList);
  },
};

export default updateFCMembers;
