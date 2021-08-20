import DaysCommand from './Days';
import PingCommand from './Ping';
import { SlashCommand } from './SlashCommand';

export default [DaysCommand, PingCommand];
export const commandForGlobal: SlashCommand[] = [PingCommand];
export const commandsForTesting: SlashCommand[] = [DaysCommand];
export const commandsForCoT: SlashCommand[] = [];
