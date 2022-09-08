import DaysCommand from './Days.js';
import PingCommand from './Ping.js';
import type { SlashCommands } from './SlashCommands.js';

export default [DaysCommand, PingCommand];
export const commandsDataForGlobal: SlashCommands[] = [PingCommand];
export const commandsDataForTesting: SlashCommands[] = [DaysCommand];
export const commandsDataForCoT: SlashCommands[] = [];
export { SlashCommands };
