import type { XIVFreeCompany } from './types.js';
import redisClient from '../../redisClient.js';
import { ONE_HOUR_IN_SECONDS } from '../../consts.js';
import fetchNodestoneFreecompany from './fetch-nodestone-freecompany.js';

const getNodestoneFreecompany = async (apiId: string): Promise<XIVFreeCompany> => {
  const redisFCDataKey = `Nodestone:FCData:${apiId}`;
  try {
    const fcDataString = await redisClient.get(redisFCDataKey);
    if (fcDataString) {
      return JSON.parse(fcDataString) as XIVFreeCompany;
    }
  } catch {
    /* do nothing, just pull a fresh list */
  }
  const freshFCData = await fetchNodestoneFreecompany(apiId);
  if (freshFCData) {
    void redisClient.set(redisFCDataKey, JSON.stringify(freshFCData), 'EX', ONE_HOUR_IN_SECONDS * 6);
  }
  return freshFCData;
};

export default getNodestoneFreecompany;
