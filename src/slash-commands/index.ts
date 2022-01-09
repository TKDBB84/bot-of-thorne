import cotCommands from './cot-commands';
import globalCommands from './global-commands';
import testServerCommands from './test-server-commands';

export type { SlashCommand, GuildSlashCommand, GlobalSlashCommand } from './SlashCommand';
export { default as commandsForGlobal } from './global-commands';
export { default as commandsForCoT } from './cot-commands';
export { default as commandsForTesting } from './test-server-commands';

export default [...testServerCommands, ...cotCommands, ...globalCommands];
