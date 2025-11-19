import pino from "pino";
import { isDev, isTest } from "../constants/constant";

export const logger = pino({
  level: isTest ? "silent" : isDev ? "debug" : "info",
  base: undefined, // remove pid, hostname (cleaner logs)
  serializers: {
    err: pino.stdSerializers.err,
    error: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  // Disable transport in Next.js to avoid worker thread issues
  // transport: isDev
  //   ? {
  //       target: "pino-pretty",
  //       options: {
  //         colorize: true,
  //         ignore: "pid,hostname",
  //         translateTime: "SYS:standard",
  //         singleLine: false,
  //         messageFormat: "{levelLabel} [{context}] {msg}",
  //       },
  //     }
  //   : undefined, // production log stays JSON (best for cloud)
  // Production: structured JSON logs
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});
