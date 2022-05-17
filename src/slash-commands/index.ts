import DaysCommand from './Days.js';
import PingCommand from './Ping.js';
import type { SlashCommand } from './SlashCommand';

export default [DaysCommand, PingCommand];
export const commandsDataForGlobal: SlashCommand[] = [PingCommand];
export const commandsDataForTesting: SlashCommand[] = [DaysCommand];
export const commandsDataForCoT: SlashCommand[] = [];
