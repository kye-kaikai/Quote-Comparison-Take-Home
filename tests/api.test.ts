import { test, expect } from '@jest/globals';
const request = require('supertest');
const app = require('../src/index').default;

const oneQuote = [{ 'carrier': 'carrier-a' }];
const twoQuotes = [{ 'carrier': 'carrier-a' }, { 'carrier': 'carrier-c' }];

test('empty body throws 400 error', async () => {
    const response = await request(app).post('/api/compare').send();
    expect(response.statusCode).toBe(400);
});

test('missing quotes property throws 400 error', async () => {
    const response = await request(app).post('/api/compare').send({});
    expect(response.statusCode).toBe(400);
});

test('zero-lengthed quotes array throws 400 error', async () => {
    const response = await request(app).post('/api/compare').send({ "quotes": [] });
    expect(response.statusCode).toBe(400);
});

test('1 quote sends back 200 with no variances and no gaps', async () => {
    const response = await request(app).post('/api/compare').send({ "quotes": oneQuote });
    expect(response.statusCode).toBe(200);
    expect(response.body.insights.coverageGaps.length).toBe(0);
    expect(response.body.insights.significantDifferences.length).toBe(0);
});

test('2+ quotes sends back 200', async () => {
    const response = await request(app).post('/api/compare').send({ "quotes": twoQuotes });
    expect(response.statusCode).toBe(200);
    expect(response.body.insights.coverageGaps.length).toBe(1);
    expect(response.body.insights.significantDifferences.length).toBe(1);
});