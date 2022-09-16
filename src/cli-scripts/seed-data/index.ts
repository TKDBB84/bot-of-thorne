import dataSource from '../../data-source.js';
import logger from '../../logger.js';
import { Character /*, User */ } from '../../entities/index.js';
import toons from './ffxiv-char-data.js';
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

  const newToons: Character[] = [];
  for (const toon of toons) {
    newToons.push(
      charRepo.create({
        apiId: toon.apiId.toString(),
        name: toon.name,
        first_seen_in_fc: toon.firstSeenApi,
        last_seen_in_fc: toon.lastSeenApi,
      }),
    );
  }
  await charRepo.save(newToons)
}

main()
  .then(() => process.exit())
  .catch((e) => {
    logger.error('Error Seeding Data', e);
    process.exit(1);
  });
