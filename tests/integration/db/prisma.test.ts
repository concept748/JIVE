import { describe, test, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { prisma } from '@/lib/db/prisma';

describe('Prisma Integration', () => {
  const testProjects: string[] = [];

  // Helper to create test project config
  const createTestConfig = () => ({
    prdFile: 'docs/prd.md',
    prdSharded: false,
    architectureFile: 'docs/architecture.md',
    architectureSharded: false,
    devStoryLocation: 'docs/stories',
    qaLocation: 'docs/qa',
  });

  beforeAll(async () => {
    // Ensure connection
    try {
      await prisma.$connect();
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  });

  afterEach(async () => {
    // Cleanup test projects after each test
    if (testProjects.length > 0) {
      await prisma.project.deleteMany({
        where: {
          id: {
            in: testProjects,
          },
        },
      });
      testProjects.length = 0;
    }
  });

  afterAll(async () => {
    // Disconnect from database
    await prisma.$disconnect();
  });

  test('connects to database successfully', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as value`;
    expect(result).toBeDefined();
  });

  test('creates and retrieves project', async () => {
    const project = await prisma.project.create({
      data: {
        name: 'Test Project',
        repoUrl: `https://github.com/test/repo-${Date.now()}`,
        webhookSecret: 'test-secret',
        config: createTestConfig(),
      },
    });

    testProjects.push(project.id);

    const retrieved = await prisma.project.findUnique({
      where: { id: project.id },
    });

    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe('Test Project');
    expect(retrieved?.repoUrl).toContain('github.com/test/repo');
  });

  test('updates project', async () => {
    const project = await prisma.project.create({
      data: {
        name: 'Test Project',
        repoUrl: `https://github.com/test/update-${Date.now()}`,
        webhookSecret: 'test-secret',
        config: createTestConfig(),
      },
    });

    testProjects.push(project.id);

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: { name: 'Updated Project Name' },
    });

    expect(updated.name).toBe('Updated Project Name');
  });

  test('creates project with artifacts relation', async () => {
    const project = await prisma.project.create({
      data: {
        name: 'Test Project with Artifacts',
        repoUrl: `https://github.com/test/artifacts-${Date.now()}`,
        webhookSecret: 'test-secret',
        config: createTestConfig(),
        artifacts: {
          create: [
            {
              path: 'docs/prd.md',
              name: 'PRD',
              type: 'PRD',
              dependencies: [],
            },
            {
              path: 'docs/architecture.md',
              name: 'Architecture',
              type: 'ARCHITECTURE',
              dependencies: [],
            },
          ],
        },
      },
      include: {
        artifacts: true,
      },
    });

    testProjects.push(project.id);

    expect(project.artifacts).toHaveLength(2);
    expect(project.artifacts[0].type).toBe('PRD');
    expect(project.artifacts[1].type).toBe('ARCHITECTURE');
  });

  test('enforces unique constraint on project repoUrl', async () => {
    const repoUrl = `https://github.com/test/unique-${Date.now()}`;

    const project1 = await prisma.project.create({
      data: {
        name: 'Test Project 1',
        repoUrl,
        webhookSecret: 'test-secret',
        config: createTestConfig(),
      },
    });

    testProjects.push(project1.id);

    // Attempt to create duplicate repoUrl should fail
    await expect(
      prisma.project.create({
        data: {
          name: 'Test Project 2',
          repoUrl, // Same repoUrl
          webhookSecret: 'test-secret',
          config: createTestConfig(),
        },
      }),
    ).rejects.toThrow();
  });

  test('creates webhook event with relation to project', async () => {
    const project = await prisma.project.create({
      data: {
        name: 'Test Project with Webhook',
        repoUrl: `https://github.com/test/webhook-${Date.now()}`,
        webhookSecret: 'test-secret',
        config: createTestConfig(),
        webhookEvents: {
          create: {
            id: `test-webhook-${Date.now()}`,
            source: 'GITHUB',
            eventType: 'push',
            payloadHash: 'abc123',
          },
        },
      },
      include: {
        webhookEvents: true,
      },
    });

    testProjects.push(project.id);

    expect(project.webhookEvents).toHaveLength(1);
    expect(project.webhookEvents[0].source).toBe('GITHUB');
    expect(project.webhookEvents[0].processed).toBe(false);
  });

  test('deletes project cascades to related artifacts', async () => {
    const project = await prisma.project.create({
      data: {
        name: 'Test Project for Cascade',
        repoUrl: `https://github.com/test/cascade-${Date.now()}`,
        webhookSecret: 'test-secret',
        config: createTestConfig(),
        artifacts: {
          create: {
            path: 'docs/prd.md',
            name: 'PRD',
            type: 'PRD',
            dependencies: [],
          },
        },
      },
      include: {
        artifacts: true,
      },
    });

    const artifactId = project.artifacts[0].id;

    // Delete project
    await prisma.project.delete({
      where: { id: project.id },
    });

    // Verify artifact was cascade deleted
    const artifact = await prisma.artifact.findUnique({
      where: { id: artifactId },
    });

    expect(artifact).toBeNull();
  });
});
