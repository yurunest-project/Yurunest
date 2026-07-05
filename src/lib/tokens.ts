import { randomBytes } from "node:crypto";

export function createSecureToken() {
  return randomBytes(32).toString("hex");
}

export function tokenExpiresInHours(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}
