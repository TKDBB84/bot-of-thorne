import { command as DaysCommand, registrationData as DaysRegistration } from './days/index.js';
import { command as PingCommand, registrationData as PingRegistration } from './ping/index.js';

export * from './types.js';
export const registrationData = [DaysRegistration, PingRegistration];
export default [DaysCommand, PingCommand];
