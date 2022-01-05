import DaysCommand from './Days';
import PingCommand from './Ping';
import { SlashCommand } from './SlashCommand';

export default [DaysCommand, PingCommand];
export const commandsDataForGlobal: SlashCommand[] = [PingCommand];
export const commandsDataForTesting: SlashCommand[] = [DaysCommand];
export const commandsDataForCoT: SlashCommand[] = [];
