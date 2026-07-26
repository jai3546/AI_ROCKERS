/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the DB service to keep the API route tests isolated from the database.
const mockDb = vi.hoisted(() => ({
  getLearningStyleProfile: vi.fn(),
  saveLearningStyleProfile: vi.fn(),
}));

vi.mock('@/services/db-service', () => ({
  getLearningStyleProfile: mockDb.getLearningStyleProfile,
  saveLearningStyleProfile: mockDb.saveLearningStyleProfile,
}));

// Import after the mock so the route picks up the stubbed module.
import { GET, POST } from './route';

// Helper to build an undecoded Request for the GET handler with parameters.
function makeGetRequest(params: Record<string, string>): Request {
  const url = new URL('http://localhost/api/learning-style');
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return new Request(url);
}

function makePostRequest(body: unknown): Request {
  return new Request('http://localhost/api/learning-style', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function bodyOf(res: Response): Promise<any> {
  return await res.json();
}

describe('GET /api/learning-style', () => {
  beforeEach(() => {
    mockDb.getLearningStyleProfile.mockReset();
  });

  it('rejects requests with no studentId (400)', async () => {
    const res = await GET(makeGetRequest({}));
    expect(res.status).toBe(400);
    expect((await bodyOf(res)).error).toMatch(/studentId/);
  });

  it('rejects an empty studentId (400)', async () => {
    const res = await GET(makeGetRequest({ studentId: '   ' }));
    expect(res.status).toBe(400);
  });

  it('responds with found:false + zeroed scores when nothing is persisted', async () => {
    mockDb.getLearningStyleProfile.mockResolvedValue(null);
    const res = await GET(makeGetRequest({ studentId: 'user-1' }));
    expect(res.status).toBe(200);
    const json = await bodyOf(res);
    expect(json.found).toBe(false);
    expect(json.visualScore).toBe(0);
    expect(json.auditoryScore).toBe(0);
    expect(json.kinestheticScore).toBe(0);
    expect(json.lastUpdated).toBeNull();
  });

  it('reflects the persisted scores + lastUpdated when the row exists', async () => {
    const lastUpdated = new Date('2026-07-26T00:00:00.000Z');
    mockDb.getLearningStyleProfile.mockResolvedValue({
      visualScore: 53,
      auditoryScore: 24,
      kinestheticScore: 23,
      lastUpdated,
    });
    const res = await GET(makeGetRequest({ studentId: 'user-1', domainType: 'main' }));
    expect(res.status).toBe(200);
    const json = await bodyOf(res);
    expect(json).toEqual({
      visualScore: 53,
      auditoryScore: 24,
      kinestheticScore: 23,
      lastUpdated: lastUpdated.toISOString(),
      found: true,
    });
    expect(mockDb.getLearningStyleProfile).toHaveBeenCalledWith('user-1', 'main');
  });

  it('defaults domainType to "default"', async () => {
    mockDb.getLearningStyleProfile.mockResolvedValue(null);
    await GET(makeGetRequest({ studentId: 'user-1' }));
    expect(mockDb.getLearningStyleProfile.mock.calls[0]?.[1]).toBe('default');
  });

  it('returns 500 when the DB layer throws', async () => {
    mockDb.getLearningStyleProfile.mockRejectedValue(new Error('boom'));
    const res = await GET(makeGetRequest({ studentId: 'user-1' }));
    expect(res.status).toBe(500);
    const json = await bodyOf(res);
    expect(json.error).toMatch(/boom/);
  });
});

describe('POST /api/learning-style', () => {
  beforeEach(() => {
    mockDb.saveLearningStyleProfile.mockReset();
  });

  it('rejects requests missing studentId (400)', async () => {
    const res = await POST(
      makePostRequest({
        visualScore: 50,
        auditoryScore: 30,
        kinestheticScore: 20,
      }),
    );
    expect(res.status).toBe(400);
    expect((await bodyOf(res)).error).toMatch(/studentId/);
  });

  it('rejects requests with a non-string studentId (400)', async () => {
    const res = await POST(
      makePostRequest({
        studentId: 123,
        visualScore: 50,
        auditoryScore: 30,
        kinestheticScore: 20,
      }),
    );
    expect(res.status).toBe(400);
  });

  it('rejects requests missing one of the three score fields (400)', async () => {
    const res = await POST(
      makePostRequest({
        studentId: 'user-1',
        visualScore: 50,
        auditoryScore: 30,
        // kinestheticScore missing
      }),
    );
    expect(res.status).toBe(400);
    expect((await bodyOf(res)).error).toMatch(/Scores must be numbers/);
  });

  it('rejects requests where a score is a non-number (400)', async () => {
    const res = await POST(
      makePostRequest({
        studentId: 'user-1',
        visualScore: 'fifty',
        auditoryScore: 30,
        kinestheticScore: 20,
      }),
    );
    expect(res.status).toBe(400);
  });

  it('accepts a valid request + forwards it to saveLearningStyleProfile', async () => {
    const lastUpdated = new Date('2026-07-26T01:00:00.000Z');
    mockDb.saveLearningStyleProfile.mockResolvedValue({ lastUpdated });
    const res = await POST(
      makePostRequest({
        studentId: 'user-1',
        visualScore: 53,
        auditoryScore: 24,
        kinestheticScore: 23,
        domainType: 'special',
      }),
    );
    expect(res.status).toBe(200);
    const json = await bodyOf(res);
    expect(json.saved).toBe(true);
    expect(json.lastUpdated).toBe(lastUpdated.toISOString());
    expect(mockDb.saveLearningStyleProfile).toHaveBeenCalledWith(
      'user-1',
      { visualScore: 53, auditoryScore: 24, kinestheticScore: 23 },
      'special',
    );
  });

  it('defaults domainType to "default" when not provided', async () => {
    mockDb.saveLearningStyleProfile.mockResolvedValue({ lastUpdated: new Date() });
    await POST(
      makePostRequest({
        studentId: 'user-1',
        visualScore: 53,
        auditoryScore: 24,
        kinestheticScore: 23,
      }),
    );
    const call = mockDb.saveLearningStyleProfile.mock.calls[0];
    expect(call?.[2]).toBe('default');
  });

  it('returns 500 when the DB layer throws', async () => {
    mockDb.saveLearningStyleProfile.mockRejectedValue(new Error('boom'));
    const res = await POST(
      makePostRequest({
        studentId: 'user-1',
        visualScore: 53,
        auditoryScore: 24,
        kinestheticScore: 23,
      }),
    );
    expect(res.status).toBe(500);
    const json = await bodyOf(res);
    expect(json.error).toMatch(/boom/);
  });

  it('returns 500 when the request body is invalid JSON', async () => {
    const req = new Request('http://localhost/api/learning-style', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{not-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});
