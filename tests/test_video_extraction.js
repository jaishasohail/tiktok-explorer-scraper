'use strict';

const { normalizeVideoItem, extractVideos } = require('../src/extractors/video_parser');

describe('video_parser.normalizeVideoItem', () => {
 it('normalizes a rich video item into the standard schema', () => {
 const raw = {
 id: '1234567890',
 desc: 'Exploring space with new designs',
 author: {
 uniqueId: 'elonmusk',
 stats: {
 followerCount: 1000000,
 },
 },
 stats: {
 diggCount: 23400,
 commentCount: 180,
 shareCount: 57,
 },
 music: {
 id: 'm123',
 title: 'Space Vibes',
 authorName: 'DJ Stellar',
 },
 video: {
 downloadAddr: 'https://example.com/download/1234567890',
 playAddr: 'https://example.com/play/1234567890',
 },
 };

 const normalized = normalizeVideoItem(raw);

 expect(normalized).toEqual({
 id: '1234567890',
 type: 'video',
 username: 'elonmusk',
 title: 'Exploring space with new designs',
 likes: 23400,
 comments: 180,
 shares: 57,
 music: {
 id: 'm123',
 title: 'Space Vibes',
 artist: 'DJ Stellar',
 },
 place: null,
 video: {
 downloadAddr: 'https://example.com/download/1234567890',
 playAddr: 'https://example.com/play/1234567890',
 },
 url: 'https://www.tiktok.com/@elonmusk/video/1234567890',
 });
 });
});

describe('video_parser.extractVideos', () => {
 it('extracts videos from a structured API response', () => {
 const apiResponse = {
 data: {
 videos: [
 {
 id: 'abc',
 desc: 'Test video',
 author: { uniqueId: 'tester' },
 stats: {
 diggCount: 10,
 commentCount: 2,
 shareCount: 1,
 },
 music: {
 id: 'music1',
 title: 'Test Song',
 authorName: 'Tester',
 },
 video: {
 downloadAddr: 'https://example.com/download/abc',
 playAddr: 'https://example.com/play/abc',
 },
 },
 ],
 },
 };

 const results = extractVideos(apiResponse, { term: 'test', limit: 5 });
 expect(Array.isArray(results)).toBe(true);
 expect(results.length).toBe(1);
 expect(results[0].id).toBe('abc');
 expect(results[0].username).toBe('tester');
 expect(results[0].type).toBe('video');
 });

 it('falls back to mock data when API response is missing', () => {
 const results = extractVideos(null, { term: 'fallback', limit: 3 });
 expect(results.length).toBe(3);
 expect(results[0].id).toContain('mock-fallback-');
 expect(results[0].type).toBe('video');
 });
});