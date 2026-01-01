import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';
import chalk from 'chalk';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const method = req.method;
    const url = req.originalUrl;

    let statusColor = chalk.green;
    if (status >= 300) statusColor = chalk.cyan;
    if (status >= 400) statusColor = chalk.yellow;
    if (status >= 500) statusColor = chalk.red;

    const methodColor = (m: string) => {
      if (m === 'GET') return chalk.blue.bold(m.padEnd(6));
      if (m === 'POST') return chalk.green.bold(m.padEnd(6));
      if (m === 'PUT') return chalk.yellow.bold(m.padEnd(6));
      if (m === 'DELETE') return chalk.red.bold(m.padEnd(6));
      if (m === 'PATCH') return chalk.magenta.bold(m.padEnd(6));
      return chalk.white.bold(m.padEnd(6));
    };

    const durationText = duration > 1000 ? chalk.red(`${duration}ms`) : duration > 500 ? chalk.yellow(`${duration}ms`) : chalk.gray(`${duration}ms`);

    logger.info(
      `${methodColor(method)} ${url} ${statusColor(status)} ${durationText}`
    );
  });

  next();
};
