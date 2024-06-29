import logger from '../../logger.js';
import getLodestoneCotMembers from '../../lib/nodestone/get-lodestone-cot-members.js';
import saveMembersToCharacters from '../../cron-jobs/update-fc-members/save-members-to-characters.js';
import updateNonMembers from '../../cron-jobs/update-fc-members/clean-up-old-members.js';

async function main() {
  // use this if you want to seed data, or something
  const memberList = await getLodestoneCotMembers();
  logger.info('Got Member List', memberList.length, { memberList });
  console.log({ memberList });
  await saveMembersToCharacters(memberList);
  await updateNonMembers(memberList);
}

main()
  .then(() => process.exit())
  .catch((e) => {
    logger.error('Error Seeding Data', e);
    process.exit(1);
  });
