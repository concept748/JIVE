import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import {
  detectBMADProject,
  validateProjectConfig,
  extractProjectName,
} from '@/lib/services/bmad-detector';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as yaml from 'js-yaml';
import type { ProjectConfig } from '@/types/project';

describe('BMAD Detector', () => {
  let testProjectPath: string;

  beforeEach(() => {
    // Create temporary directory for each test
    testProjectPath = fs.mkdtempSync(path.join(os.tmpdir(), 'bmad-test-'));
  });

  afterEach(() => {
    // Cleanup temporary directory
    if (fs.existsSync(testProjectPath)) {
      fs.rmSync(testProjectPath, { recursive: true, force: true });
    }
  });

  describe('detectBMADProject', () => {
    test('detects valid BMAD project with complete config', async () => {
      // Setup: Create .bmad-core/core-config.yaml with valid config
      const bmadDir = path.join(testProjectPath, '.bmad-core');
      fs.mkdirSync(bmadDir);

      const config: ProjectConfig = {
        prdFile: 'docs/prd.md',
        prdVersion: 'v4',
        prdSharded: true,
        prdShardedLocation: 'docs/prd',
        architectureFile: 'docs/architecture.md',
        architectureVersion: 'v4',
        architectureSharded: true,
        architectureShardedLocation: 'docs/architecture',
        devStoryLocation: 'docs/stories',
        qaLocation: 'docs/qa',
        epicFilePattern: 'epic-{n}*.md',
      };

      const yamlContent = yaml.dump(config);
      fs.writeFileSync(path.join(bmadDir, 'core-config.yaml'), yamlContent);

      // Execute
      const result = await detectBMADProject(testProjectPath);

      // Assert
      expect(result.detected).toBe(true);
      expect(result.config).toBeDefined();
      expect(result.config?.prdFile).toBe('docs/prd.md');
      expect(result.config?.architectureFile).toBe('docs/architecture.md');
      expect(result.config?.devStoryLocation).toBe('docs/stories');
      expect(result.config?.qaLocation).toBe('docs/qa');
      expect(result.config?.prdSharded).toBe(true);
      expect(result.config?.architectureSharded).toBe(true);
      expect(result.name).toBe(path.basename(testProjectPath));
      expect(result.path).toBe(testProjectPath);
      expect(result.error).toBeUndefined();
    });

    test('detects valid BMAD project with minimal required config', async () => {
      // Setup: Create config with only required fields
      const bmadDir = path.join(testProjectPath, '.bmad-core');
      fs.mkdirSync(bmadDir);

      const config = {
        prdFile: 'docs/prd.md',
        prdSharded: false,
        architectureFile: 'docs/architecture.md',
        architectureSharded: false,
        devStoryLocation: 'docs/stories',
        qaLocation: 'docs/qa',
      };

      const yamlContent = yaml.dump(config);
      fs.writeFileSync(path.join(bmadDir, 'core-config.yaml'), yamlContent);

      // Execute
      const result = await detectBMADProject(testProjectPath);

      // Assert
      expect(result.detected).toBe(true);
      expect(result.config).toBeDefined();
      expect(result.config?.prdFile).toBe('docs/prd.md');
      expect(result.error).toBeUndefined();
    });

    test('returns detected=false for missing .bmad-core directory', async () => {
      // Execute (no setup - empty directory)
      const result = await detectBMADProject(testProjectPath);

      // Assert
      expect(result.detected).toBe(false);
      expect(result.config).toBeUndefined();
      expect(result.name).toBe(path.basename(testProjectPath));
      expect(result.path).toBe(testProjectPath);
      expect(result.error).toBeUndefined(); // No error, just not detected
    });

    test('returns detected=false for missing core-config.yaml', async () => {
      // Setup: Create .bmad-core directory but no core-config.yaml
      const bmadDir = path.join(testProjectPath, '.bmad-core');
      fs.mkdirSync(bmadDir);

      // Execute
      const result = await detectBMADProject(testProjectPath);

      // Assert
      expect(result.detected).toBe(false);
      expect(result.config).toBeUndefined();
      expect(result.error).toBe('core-config.yaml not found');
    });

    test('handles malformed YAML gracefully', async () => {
      // Setup: Create core-config.yaml with invalid YAML syntax
      const bmadDir = path.join(testProjectPath, '.bmad-core');
      fs.mkdirSync(bmadDir);

      const invalidYaml = `
prdFile: "unclosed quote
architectureFile: docs/architecture.md
`;
      fs.writeFileSync(path.join(bmadDir, 'core-config.yaml'), invalidYaml);

      // Execute
      const result = await detectBMADProject(testProjectPath);

      // Assert
      expect(result.detected).toBe(false);
      expect(result.config).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Invalid YAML');
    });

    test('handles empty YAML file gracefully', async () => {
      // Setup: Create empty core-config.yaml
      const bmadDir = path.join(testProjectPath, '.bmad-core');
      fs.mkdirSync(bmadDir);

      fs.writeFileSync(path.join(bmadDir, 'core-config.yaml'), '');

      // Execute
      const result = await detectBMADProject(testProjectPath);

      // Assert
      expect(result.detected).toBe(false);
      expect(result.config).toBeUndefined();
      expect(result.error).toContain('Invalid config structure');
    });

    test('handles missing required fields - no prdFile', async () => {
      // Setup: Create core-config.yaml with missing prdFile
      const bmadDir = path.join(testProjectPath, '.bmad-core');
      fs.mkdirSync(bmadDir);

      const config = {
        architectureFile: 'docs/architecture.md',
        architectureSharded: false,
        devStoryLocation: 'docs/stories',
        qaLocation: 'docs/qa',
        prdSharded: false, // prdFile is missing
      };

      const yamlContent = yaml.dump(config);
      fs.writeFileSync(path.join(bmadDir, 'core-config.yaml'), yamlContent);

      // Execute
      const result = await detectBMADProject(testProjectPath);

      // Assert
      expect(result.detected).toBe(false);
      expect(result.config).toBeUndefined();
      expect(result.error).toContain('missing required fields');
    });

    test('handles missing required fields - no architectureFile', async () => {
      // Setup: Create core-config.yaml with missing architectureFile
      const bmadDir = path.join(testProjectPath, '.bmad-core');
      fs.mkdirSync(bmadDir);

      const config = {
        prdFile: 'docs/prd.md',
        prdSharded: false,
        devStoryLocation: 'docs/stories',
        qaLocation: 'docs/qa',
        architectureSharded: false, // architectureFile is missing
      };

      const yamlContent = yaml.dump(config);
      fs.writeFileSync(path.join(bmadDir, 'core-config.yaml'), yamlContent);

      // Execute
      const result = await detectBMADProject(testProjectPath);

      // Assert
      expect(result.detected).toBe(false);
      expect(result.error).toContain('missing required fields');
    });

    test('handles missing required boolean fields', async () => {
      // Setup: Create core-config.yaml with missing boolean fields
      const bmadDir = path.join(testProjectPath, '.bmad-core');
      fs.mkdirSync(bmadDir);

      const config = {
        prdFile: 'docs/prd.md',
        architectureFile: 'docs/architecture.md',
        devStoryLocation: 'docs/stories',
        qaLocation: 'docs/qa',
        // Missing prdSharded and architectureSharded
      };

      const yamlContent = yaml.dump(config);
      fs.writeFileSync(path.join(bmadDir, 'core-config.yaml'), yamlContent);

      // Execute
      const result = await detectBMADProject(testProjectPath);

      // Assert
      expect(result.detected).toBe(false);
      expect(result.error).toContain('missing required fields');
    });

    test('extracts project name from path correctly', async () => {
      // Setup: Create valid project
      const bmadDir = path.join(testProjectPath, '.bmad-core');
      fs.mkdirSync(bmadDir);

      const config = {
        prdFile: 'docs/prd.md',
        prdSharded: false,
        architectureFile: 'docs/architecture.md',
        architectureSharded: false,
        devStoryLocation: 'docs/stories',
        qaLocation: 'docs/qa',
      };

      const yamlContent = yaml.dump(config);
      fs.writeFileSync(path.join(bmadDir, 'core-config.yaml'), yamlContent);

      // Execute
      const result = await detectBMADProject(testProjectPath);

      // Assert
      expect(result.name).toBe(path.basename(testProjectPath));
      expect(result.name).toMatch(/^bmad-test-/); // Matches temp directory prefix
    });

    test('handles invalid YAML types gracefully', async () => {
      // Setup: Create core-config.yaml with YAML array instead of object
      const bmadDir = path.join(testProjectPath, '.bmad-core');
      fs.mkdirSync(bmadDir);

      const invalidYaml = '- item1\n- item2';
      fs.writeFileSync(path.join(bmadDir, 'core-config.yaml'), invalidYaml);

      // Execute
      const result = await detectBMADProject(testProjectPath);

      // Assert
      expect(result.detected).toBe(false);
      expect(result.error).toContain('Invalid config structure');
    });
  });

  describe('validateProjectConfig', () => {
    test('returns true for valid config with all fields', () => {
      const config: ProjectConfig = {
        prdFile: 'docs/prd.md',
        prdVersion: 'v4',
        prdSharded: true,
        prdShardedLocation: 'docs/prd',
        architectureFile: 'docs/architecture.md',
        architectureVersion: 'v4',
        architectureSharded: true,
        architectureShardedLocation: 'docs/architecture',
        devStoryLocation: 'docs/stories',
        qaLocation: 'docs/qa',
        epicFilePattern: 'epic-{n}*.md',
      };

      expect(validateProjectConfig(config)).toBe(true);
    });

    test('returns true for valid config with only required fields', () => {
      const config = {
        prdFile: 'docs/prd.md',
        prdSharded: false,
        architectureFile: 'docs/architecture.md',
        architectureSharded: false,
        devStoryLocation: 'docs/stories',
        qaLocation: 'docs/qa',
      };

      expect(validateProjectConfig(config)).toBe(true);
    });

    test('returns false for non-object values', () => {
      expect(validateProjectConfig(null)).toBe(false);
      expect(validateProjectConfig(undefined)).toBe(false);
      expect(validateProjectConfig('string')).toBe(false);
      expect(validateProjectConfig(123)).toBe(false);
      expect(validateProjectConfig([])).toBe(false);
    });

    test('returns false for missing required string fields', () => {
      const configMissingPrdFile = {
        prdSharded: false,
        architectureFile: 'docs/architecture.md',
        architectureSharded: false,
        devStoryLocation: 'docs/stories',
        qaLocation: 'docs/qa',
      };
      expect(validateProjectConfig(configMissingPrdFile)).toBe(false);

      const configMissingArchFile = {
        prdFile: 'docs/prd.md',
        prdSharded: false,
        architectureSharded: false,
        devStoryLocation: 'docs/stories',
        qaLocation: 'docs/qa',
      };
      expect(validateProjectConfig(configMissingArchFile)).toBe(false);
    });

    test('returns false for missing required boolean fields', () => {
      const config = {
        prdFile: 'docs/prd.md',
        architectureFile: 'docs/architecture.md',
        devStoryLocation: 'docs/stories',
        qaLocation: 'docs/qa',
        // Missing prdSharded and architectureSharded
      };
      expect(validateProjectConfig(config)).toBe(false);
    });

    test('returns false for wrong type in optional fields', () => {
      const configInvalidVersion = {
        prdFile: 'docs/prd.md',
        prdVersion: 123, // Should be string
        prdSharded: false,
        architectureFile: 'docs/architecture.md',
        architectureSharded: false,
        devStoryLocation: 'docs/stories',
        qaLocation: 'docs/qa',
      };
      expect(validateProjectConfig(configInvalidVersion)).toBe(false);
    });
  });

  describe('extractProjectName', () => {
    test('extracts project name from simple path', () => {
      expect(extractProjectName('/path/to/my-project')).toBe('my-project');
    });

    test('extracts project name from Windows path', () => {
      expect(extractProjectName('C:\\Users\\dev\\my-project')).toBe(
        'my-project',
      );
    });

    test('handles trailing slash', () => {
      expect(extractProjectName('/path/to/my-project/')).toBe('my-project');
    });

    test('handles complex nested paths', () => {
      expect(extractProjectName('/a/b/c/d/e/project-name')).toBe(
        'project-name',
      );
    });
  });
});
