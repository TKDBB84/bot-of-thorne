import type { SlashCommandCallback, Scope, SlashCommandRegistration } from './types.js';
import { command as DaysCommand, registrationData as DaysRegistration } from './days/index.js';
import { command as PingCommand, registrationData as PingRegistration } from './ping/index.js';

export type { SlashCommandCallback, Scope, SlashCommandRegistration };
export default [DaysCommand, PingCommand];
export const registrationData = [DaysRegistration, PingRegistration];
