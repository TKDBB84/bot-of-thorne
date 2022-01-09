import { Connection } from 'typeorm';
import { CRON_SCHEDULE } from './consts';
import { COTMember } from './entities';
import axios from 'axios';
import pThrottle from 'p-throttle';

export declare interface CronJob {
  exec(connection: Connection): Promise<void>;
  schedule: string;
}

const prepareCharacterCards: CronJob = {
  schedule: CRON_SCHEDULE.EVERY_THREE_HOURS,
  async exec(connection: Connection): Promise<void> {
    const throttle = pThrottle({
      limit: 5,
      interval: 2000,
    });
    const throttledGenerateCard = throttle(
      (apiId?: number | string) =>
        apiId && axios.get(`https://ffxiv-character-cards.herokuapp.com/prepare/id/${apiId.toString()}`),
    );
    const cotMembers = await connection.getRepository<COTMember>(COTMember).find();
    const allThrottled: Promise<unknown>[] = [];
    for (let i = 0, iMax = cotMembers.length; i < iMax; i++) {
      const { apiId } = cotMembers[i]?.character;
      const throttledPromise = throttledGenerateCard(apiId);
      allThrottled.push(throttledPromise);
    }
    await Promise.all(allThrottled);
  },
};

const exportedJobs: CronJob[] = [prepareCharacterCards];

export default exportedJobs;
