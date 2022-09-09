#!/usr/bin/env node
import type { SlashCommandRegistration } from '../../slash-commands/index.js';
import { createHash } from 'node:crypto';
import dataSource from '../../data-source.js';
import { SlashCommand } from '../../entities/index.js';
import registerCommands from './register-command.js';
import { registrationData } from '../../slash-commands/index.js';

const commandRepo = dataSource.getRepository(SlashCommand);
const registerSlashCommands = async (): Promise<number> => {
  const allRegisteredSlashCommands = await commandRepo.find();
  const allToRegister: SlashCommandRegistration[] = [];
  for (const registrationDatum of registrationData) {
    if (registrationDatum.readyToRegister) {
      const checksum = createHash('sha1').update(JSON.stringify(registrationDatum), 'utf8').digest('hex');
      const command = allRegisteredSlashCommands.find(
        (_command) => _command.commandName === registrationDatum.registrationData.name,
      );
      const needsToBeRegistered = !command || command.checksum !== checksum;
      if (needsToBeRegistered) {
        allToRegister.push(registrationDatum);
        const data = { commandName: registrationDatum.registrationData.name, checksum };
        if (command && command.id) {
          await commandRepo.update(command.id, data);
        } else {
          await commandRepo.save(commandRepo.create(data));
        }
      }
    }
    await registerCommands(allToRegister);
  }
  return 0;
};

registerSlashCommands()
  .then((code) => process.exit(code))
  .catch((e) => process.exit(e ? 1 : 0));
