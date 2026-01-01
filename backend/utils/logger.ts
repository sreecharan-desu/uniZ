import winston from 'winston';
import chalk from 'chalk';

const logFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  const ts = chalk.gray(`[${timestamp}]`);
  
  let coloredLevel = level.toUpperCase();
  // Pad level to ensure alignment
  const levelPadding = ' '.repeat(7 - level.length); 
  
  if (level === 'info') coloredLevel = chalk.blueBright.bold(coloredLevel);
  else if (level === 'error') coloredLevel = chalk.red.bold(coloredLevel);
  else if (level === 'warn') coloredLevel = chalk.yellow.bold(coloredLevel);
  else if (level === 'debug') coloredLevel = chalk.magenta.bold(coloredLevel);

  let logMessage = `${ts} ${coloredLevel}${levelPadding} │ ${message}`;
  
  // If there's metadata (like object), pretty print it
  if (Object.keys(meta).length > 0) {
     logMessage += `\n${chalk.gray(JSON.stringify(meta, null, 2))}`;
  }

  return logMessage;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.Console()
  ],
});
