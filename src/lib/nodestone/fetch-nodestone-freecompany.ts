import type { XIVFreeCompany, XIVFreeCompanyResponse } from './types.js';
import nodeStoneRequest from './request.js';

const fetchNodestoneFreecompany = async (apiId: string): Promise<XIVFreeCompany> => {
  const { data } = await nodeStoneRequest.get<XIVFreeCompanyResponse>(`/freecompany/${apiId}`);
  return data.FreeCompany;
};

export default fetchNodestoneFreecompany;
