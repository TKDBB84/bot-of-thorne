import dataSource from '../../data-source.js';
import logger from '../../logger.js';
import { Character /*, User */ } from '../../entities/index.js';
import dayjs from 'dayjs';
import { CoTAPIId } from '../../consts.js';
// import users from './user-data.js';

const charRepo = dataSource.getRepository(Character);
// const userRepo = dataSource.getRepository(User);
async function main() {
  // const newUsers: User[] = [];
  // for (const sbUser of users) {
  //   newUsers.push(
  //     userRepo.create({
  //       id: sbUser.discordUserId,
  //       timezone: sbUser.timezone || 'Etc/UTC',
  //     }),
  //   );
  // }
  // await userRepo.save(newUsers);

  const allChars = await charRepo.find()
  const toUpdate: Character[] = []
  for (const char of allChars) {
    const shouldBeLastSeen = dayjs(new Date('2022-09-15'))
    const thisLastSeen = dayjs(char.last_seen_in_fc)
    if (thisLastSeen.isAfter(shouldBeLastSeen)) {
      char.free_company_id = CoTAPIId
      char.free_company_name = 'Crowne of Thorne'
      toUpdate.push(char)
    }
  }
  await charRepo.save(toUpdate)
}

main()
  .then(() => process.exit())
  .catch((e) => {
    logger.error('Error Seeding Data', e);
    process.exit(1);
  });
