'use strict';

const { normalizeUserItem, extractUsers } = require('../src/extractors/user_parser');

describe('user_parser.normalizeUserItem', () => {
 it('normalizes a rich user profile into the standard schema', () => {
 const raw = {
 id: 'user123',
 user: {
 uniqueId: 'elonmusk',
 nickname: 'Elon Musk',
 signature: 'Space, cars, and more.',
 },
 stats: {
 followerCount: 100000000,
 followingCount: 50,
 heartCount: 999999999,
 videoCount: 150,
 },
 };

 const normalized = normalizeUserItem(raw);

 expect(normalized).toEqual({
 id: 'user123',
 type: 'user',
 username: 'elonmusk',
 displayName: 'Elon Musk',
 followers: 100000000,
 following: 50,
 likes: 999999999,
 videos: 150,
 bio: 'Space, cars, and more.',
 avatarUrl: null,
 url: 'https://www.tiktok.com/@elonmusk',
 });
 });
});

describe('user_parser.extractUsers', () => {
 it('extracts users from a structured API response', () => {
 const apiResponse = {
 userList: [
 {
 user: {
 id: '111',
 uniqueId: 'tester1',
 nickname: 'Tester 1',
 signature: 'First tester',
 stats: {
 followerCount: 100,
 followingCount: 10,
 heartCount: 500,
 videoCount: 3,
 },
 },
 },
 ],
 };

 const results = extractUsers(apiResponse, { term: 'tester', limit: 10 });
 expect(Array.isArray(results)).toBe(true);
 expect(results.length).toBe(1);
 expect(results[0].id).toBe('111');
 expect(results[0].username).toBe('tester1');
 expect(results[0].type).toBe('user');
 });

 it('falls back to mock users when API response is missing', () => {
 const results = extractUsers(null, { term: 'offline', limit: 2 });
 expect(results.length).toBe(2);
 expect(results[0].id).toContain('mock-user-offline-');
 expect(results[0].type).toBe('user');
 });
});