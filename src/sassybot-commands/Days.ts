import type { Client } from 'discord.js';
type daysParams = {
  isOfficerQuery: boolean;
  numDays: number;
  charName: string;
  authorId: string;
  channelId: string;
  messageId: string;
};
const SassybotDays = {
  eventName: 'daysRequest',
  async exec(discordClient: Client, { numDays, charName, channelId, messageId }: daysParams) {
    const channel = await discordClient.channels.fetch(channelId);
    if (channel?.isTextBased()) {
      let daysInFc = `${charName} has been `;
      if (charName.toLowerCase().includes('minfilia')) {
        daysInFc += 'locked in the Waking Sands ';
      } else {
        daysInFc += 'in the FC ';
      }
      daysInFc += `for approximately ${numDays} days.`;
      void channel.send({
        content: daysInFc,
        reply: { messageReference: messageId },
      });
    }
  },
};
export default SassybotDays;
