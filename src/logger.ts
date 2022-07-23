import { format, transports, createLogger } from 'winston';
import { consoleFormat } from 'winston-console-format';

const logger = createLogger({
  defaultMeta: { service: 'bot-of-thrones' },
  level: 'debug',
  format: format.combine(
    format.timestamp(),
    format.ms(),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  transports: [
    new transports.Console({
      consoleWarnLevels: ['warning', 'notice'],
      stderrLevels: ['error', 'emerg', 'alert', 'crit'],
      level: 'info',
      handleExceptions: true,
      handleRejections: true,
      format: format.combine(
        format.colorize({ all: true }),
        format.padLevels(),
        consoleFormat({
          showMeta: true,
          metaStrip: ['service'],
          inspectOptions: {
            depth: Infinity,
            colors: true,
            maxArrayLength: Infinity,
            breakLength: 120,
            compact: Infinity,
          },
        }),
      ),
    }),
  ],
});

export default logger;
