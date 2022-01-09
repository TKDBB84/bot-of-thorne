import PingCommand from './Ping';
import { GlobalSlashCommand } from '../SlashCommand';

const globalCommands: GlobalSlashCommand[] = [PingCommand];

export default globalCommands;
