import type { Maybe } from './types';

export const getOrThrow = <T>(value: Maybe<T>, message: string): T => {
  if (!value) throw new Error(message);
  return value;
};