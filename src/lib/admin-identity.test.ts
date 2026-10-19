import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('drizzle/migrations/0002_authorize_additional_blink_admin.sql', 'utf8');
const condition = migration.match(/IF ([\s\S]*?) THEN/)?.[1] ?? '';
const allowedEmails = [...condition.matchAll(/'([^']+@[^']+)'/g)].map((match) => match[1]);

describe('Verified administrative identities', () => {
  it('includes the additional administrator authorized by the user', () => {
    expect(allowedEmails).toContain('renanneublum@gmail.com');
  });
  it('preserves the existing administrator', () => {
    expect(allowedEmails).toContain('otaviotoledo610@gmail.com');
  });
  it('limits automatic grants to the two authorized identities', () => {
    expect(allowedEmails.sort()).toEqual(['otaviotoledo610@gmail.com', 'renanneublum@gmail.com']);
  });
  it('requires confirmed email before granting either administrator', () => {
    expect(condition).toMatch(/AND NEW\.email_confirmed_at IS NOT NULL$/);
  });
});