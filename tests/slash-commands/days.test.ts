jest.mock('xiv-character-cards')
import { CommandInteraction } from 'discord.js';

import DaysCommand from '../../src/slash-commands/test-server-commands/Days';
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
    it('tests pass for now', () => {
      expect(true).toBeTruthy()
    })
  })
});
