export declare type XIVCharacterBase = {
  ID: number;
  Name: string;
  Avatar: string;
};

export declare type XIVCharacter = XIVCharacterBase & {
  Bio: string;
  Portrait: string;
  FreeCompany: {
    ID: string;
  };
};

export declare type XIVApiPagination = {
  Page: number;
  PageTotal: number;
  PageNext: number;
  PagePrev: number;
};

export declare type XIVFreeCompanyMemberListEntry = XIVCharacterBase & {
  FcRank: string;
  FcRankIcon: string;
};

export declare type XIVFreeCompany = {
  ID: string;
  Name: string;
};

export declare type XIVFreeCompanyResponse = {
  FreeCompany: XIVFreeCompany;
};

export declare type XIVFreeCompanyResponseWithMembers = XIVFreeCompanyResponse & {
  FreeCompanyMembers: {
    List: XIVFreeCompanyMemberListEntry[];
    Pagination: XIVApiPagination;
  };
};

export declare type XIVCharacterResponse = {
  Character: XIVCharacter;
};
