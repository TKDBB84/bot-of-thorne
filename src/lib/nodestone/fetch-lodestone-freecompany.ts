import type { XIVFreeCompany, XIVFreeCompanyResponse } from './types.js';
import axios from 'axios';

const fetchLodestoneFreecompany = async (apiId: string): Promise<XIVFreeCompany> => {
  const { data } = await axios.get<XIVFreeCompanyResponse>(`http://localhost:8080/freecompany/${apiId}`);
  return data.FreeCompany;
};

export default fetchLodestoneFreecompany;
