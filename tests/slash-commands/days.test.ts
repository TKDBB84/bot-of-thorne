const mockedSbUserRepo = jest.fn(() => ({
  findOne: jest.fn(),
  save: jest.fn(),
}));
const mockedCharRepo = jest.fn(() => ({
  findOne: jest.fn(),
  createQueryBuilder: {
    where: {
      getOne: jest.fn(),
    },
  },
  create: jest.fn(),
  save: jest.fn(),
}));
jest.mock('xiv-character-cards')
jest.mock('typeorm', () => ({
  getRepository: jest.fn((repoType) => {
    switch (repoType.name) {
      case 'SbUser':
        return mockedSbUserRepo;
      case 'FFXIVChar':
        return mockedCharRepo;
      default:
        throw new Error('Undefined Class Call');
    }
  }),
}));
import { CommandInteraction } from 'discord.js';

import DaysCommand from '../../src/slash-commands/Days';
const guildId = 123;
const memberId = 123;
const mockInteraction = {
  inGuild: jest.fn(),
  guildId,
  member: { user: { id: memberId } },
  options: { getString: jest.fn() },
  reply: jest.fn(),
  deferReply: jest.fn(),
  editReply: jest.fn(),
} as unknown as jest.Mocked<CommandInteraction>;

describe('Days Command', () => {
  test('registered as days', () => {
    expect(DaysCommand.command).toEqual('days');
  });
  beforeAll(() => {
    mockInteraction.inGuild.mockReset();
    mockInteraction.reply.mockReset();
    mockInteraction.deferReply.mockReset();
    mockInteraction.editReply.mockReset();
  });
  describe('when not from a guild', () => {
    beforeAll(async () => {
      mockInteraction.inGuild.mockReturnValue(false)
      await DaysCommand.exec(mockInteraction)
    })
    it('does not respond', () => {
      expect(mockInteraction.reply).not.toHaveBeenCalled()
    })
    it('it does not defer', () => {
      expect(mockInteraction.deferReply).not.toHaveBeenCalled()
    })
    it('does not fetch a repo', () => {
      expect(mockedCharRepo).not.toHaveBeenCalled()
      expect(mockedSbUserRepo).not.toHaveBeenCalled()
    })
  })
});
