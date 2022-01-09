import cotCommands from './cot-commands/index.js';
import globalCommands from './global-commands/index.js';
import testServerCommands from './test-server-commands/index.js';

export type { SlashCommand, GuildSlashCommand, GlobalSlashCommand } from './SlashCommand.js';
export { default as commandsForGlobal } from './global-commands/index.js';
export { default as commandsForCoT } from './cot-commands/index.js';
export { default as commandsForTesting } from './test-server-commands/index.js';

export default [...testServerCommands, ...cotCommands, ...globalCommands];
