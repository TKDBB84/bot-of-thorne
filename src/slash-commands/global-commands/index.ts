import PingCommand from './Ping.js';
import type { GlobalSlashCommand } from '../SlashCommand.js';

const globalCommands: GlobalSlashCommand[] = [PingCommand];

export default globalCommands;
