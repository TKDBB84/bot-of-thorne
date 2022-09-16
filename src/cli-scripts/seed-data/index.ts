import logger from '../../logger.js';

async function main() {
  // use this if you want to seed data, or something
}

main()
  .then(() => process.exit())
  .catch((e) => {
    logger.error('Error Seeding Data', e);
    process.exit(1);
  });
