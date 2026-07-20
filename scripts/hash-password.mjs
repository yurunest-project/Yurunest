#!/usr/bin/env node
/**
 * 管理者用 passwordHash 生成（初回手動登録用）
 * 使い方: node scripts/hash-password.mjs "YourPassword"
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs \"YourPassword\"");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log(hash);
