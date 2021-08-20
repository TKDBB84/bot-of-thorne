declare interface CardCreatorType {
  ensureInit: () => Promise<void>
}
declare class CardCreatorClient {
  constructor();
  ensureInit: () => Promise<void>
  createCard: (charId: string | number, customImage?: string | Buffer | null ) => Promise<Buffer>
}
declare module 'xiv-character-cards' {
  export = CardCreatorClient;
}
