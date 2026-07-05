import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上にしてください")
    .max(128, "パスワードが長すぎます"),
  nickname: z
    .string()
    .trim()
    .min(1, "ニックネームを入力してください")
    .max(50, "ニックネームは50文字以内にしてください"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "パスワードは8文字以上にしてください")
    .max(128, "パスワードが長すぎます"),
});
