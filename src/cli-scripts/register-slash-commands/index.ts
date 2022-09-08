#!/usr/bin/env node
import dataSource from '../../data-source.js';
import { SlashCommand } from '../../entities/index.js';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import type { SlashCommands } from '../../slash-commands/index.js';
import registerCommands from './register-command.js';

const commandRepo = dataSource.getRepository(SlashCommand);
const registerSlashCommands = async (): Promise<number> => {
  const slashCommandPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'slash-commands');
  const slashCommandFiles = await readdir(slashCommandPath);
  const allSlashCommandPaths = slashCommandFiles
    .filter(
      (name) =>
        !name.match(/index\.[j|t]s$/i) && !name.match(/.+\.[j|t]s\.map$/i) && !name.match(/SlashCommands\.[j|t]s$/i),
    )
    .map((fileName) => join(slashCommandPath, fileName));

  const allRegisteredSlashCommands = await commandRepo.find();
  const allToRegister: SlashCommands[] = [];
  for (const filePath of allSlashCommandPaths) {
    const checksum = createHash('sha1')
      .update((await readFile(filePath, { encoding: 'utf8' })).toString(), 'utf8')
      .digest('hex');
    const command = allRegisteredSlashCommands.find((_command) => _command.filePath === filePath);
    const needsToBeRegistered = !command || command.checksum !== checksum;
    if (needsToBeRegistered) {
      const theCommand = (await import(filePath)) as SlashCommands;
      allToRegister.push(theCommand);
      const data = { commandName: theCommand.command, checksum, filePath };
      if (command && command.id) {
        await commandRepo.update(command.id, data);
      } else {
        await commandRepo.save(commandRepo.create(data));
      }
    }
  }
  await registerCommands(allToRegister);
  return 0;
};

registerSlashCommands()
  .then((code) => process.exit(code))
  .catch((e) => process.exit(e ? 1 : 0));
