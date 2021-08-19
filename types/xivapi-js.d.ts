declare interface XivApiClientOptions {
  private_key?: string;
  staging?: boolean;
  language?: string;
  snake_case?: boolean;
  verbose?: boolean;
}
declare interface XivApiPagination {
  Page: number;
  PageNext: number;
  PagePrevious: number;
  PageTotal: number;
  Results: number;
  ResultsPerPage: number;
  ResultsTotal: number;
}
declare enum Language {
  English = 'en',
  Japanese = 'ja',
  German = 'de',
  French = 'fr',
  Chinese = 'cn',
  Korean = 'kr',
}
declare interface XivApiSearchParams {
  server?: string;
  page?: string;
}
declare interface XivApiSearchResults<T> {
  Results: T[];
  Pagination: XivApiPagination;
}
declare interface XivApiCharacterSearchResult {
  Avatar: string;
  FeastMatches: number;
  ID: number;
  Lang: string;
  Name: string;
  Rank: string | null;
  RankIcon: string | null;
  Server: string;
}
declare interface XivApiGetParams {
  extended?: boolean;
  data?: string[] | string;
  columns?: string[] | string;
}

declare class XivApiClient {
  constructor(options?: XivApiClientOptions);
  character: {
    search: (name: string, params?: XivApiSearchParams) => XivApiSearchResults<XivApiCharacterSearchResult>;
    get: (id: string, params?: XivApiGetParams) => { Character: XivApiCharacterSearchResult; Info: {}; FreeCompany: {Name: string;} };
  };
  freecompany: {
    get: (id: string, params?: XivApiGetParams) => { FreeCompanyMembers: XivApiCharacterSearchResult[] };
  };
  resources: { languages: Language[] };
}
declare module '@xivapi/js' {
  export = XivApiClient;
}
