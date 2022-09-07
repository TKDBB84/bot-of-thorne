import type { BotCronJob } from '../index.js';

import updateFCMembers from './update-fc-members/index.js';

const jobs: BotCronJob[] = [updateFCMembers];
export default jobs;
export { updateFCMembers };
