import type { XIVFreeCompany, XIVFreeCompanyResponse } from './types.js';
import nodeStoneRequest from './request.js';

const fetchLodestoneFreecompany = async (apiId: string): Promise<XIVFreeCompany> => {
  const { data } = await nodeStoneRequest.get<XIVFreeCompanyResponse>(`/freecompany/${apiId}`);
  return data.FreeCompany;
};

export default fetchLodestoneFreecompany;
