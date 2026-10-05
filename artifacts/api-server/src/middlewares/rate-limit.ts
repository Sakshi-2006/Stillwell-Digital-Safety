import type { RequestHandler } from "express";

type Entry = { count: number; resetAt: number };
const windows = new Map<string, Entry>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
let lastPruneAt = 0;

export const assessmentRateLimit: RequestHandler = (req, res, next) => {
  const now = Date.now();
  if (now - lastPruneAt > WINDOW_MS) {
    for (const [key, entry] of windows) {
      if (entry.resetAt <= now) windows.delete(key);
    }
    lastPruneAt = now;
  }

  const key = req.ip ?? "unknown";
  const current = windows.get(key);
  if (!current || current.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }
  if (current.count >= MAX_REQUESTS) {
    res.status(429).json({ error: "Too many assessment requests. Please wait a minute and try again." });
    return;
  }
  current.count += 1;
  next();
};
