/**
 * BMAD Project Detector Service
 * Detects if a directory is a valid BMAD project by checking for .bmad-core/core-config.yaml
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import type { ProjectConfig, ProjectMetadata } from '@/types/project';

/**
 * Type guard to validate if a parsed YAML object is a valid ProjectConfig
 * @param config - The parsed YAML object to validate
 * @returns True if the object is a valid ProjectConfig, false otherwise
 */
export function validateProjectConfig(
  config: unknown,
): config is ProjectConfig {
  if (typeof config !== 'object' || config === null) {
    return false;
  }

  const obj = config as Record<string, unknown>;

  // Check for required string fields
  const hasRequiredStrings =
    typeof obj.prdFile === 'string' &&
    typeof obj.architectureFile === 'string' &&
    typeof obj.devStoryLocation === 'string' &&
    typeof obj.qaLocation === 'string';

  if (!hasRequiredStrings) {
    return false;
  }

  // Check for required boolean fields
  const hasRequiredBooleans =
    typeof obj.prdSharded === 'boolean' &&
    typeof obj.architectureSharded === 'boolean';

  if (!hasRequiredBooleans) {
    return false;
  }

  // Optional fields validation (if present, must be correct type)
  if (obj.prdVersion !== undefined && typeof obj.prdVersion !== 'string') {
    return false;
  }
  if (
    obj.prdShardedLocation !== undefined &&
    typeof obj.prdShardedLocation !== 'string'
  ) {
    return false;
  }
  if (
    obj.architectureVersion !== undefined &&
    typeof obj.architectureVersion !== 'string'
  ) {
    return false;
  }
  if (
    obj.architectureShardedLocation !== undefined &&
    typeof obj.architectureShardedLocation !== 'string'
  ) {
    return false;
  }
  if (
    obj.epicFilePattern !== undefined &&
    typeof obj.epicFilePattern !== 'string'
  ) {
    return false;
  }

  return true;
}

/**
 * Extract project name from project path
 * @param projectPath - Full path to project directory
 * @returns Sanitized project name (basename of directory)
 */
export function extractProjectName(projectPath: string): string {
  return path.basename(projectPath);
}

/**
 * Detect if a directory is a valid BMAD project
 * @param projectPath - Path to the directory to check
 * @returns Promise<ProjectMetadata> - Project metadata with detection result
 */
export async function detectBMADProject(
  projectPath: string,
): Promise<ProjectMetadata> {
  const projectName = extractProjectName(projectPath);

  // Check if .bmad-core directory exists
  const bmadCorePath = path.join(projectPath, '.bmad-core');
  if (!fs.existsSync(bmadCorePath)) {
    return {
      name: projectName,
      path: projectPath,
      detected: false,
    };
  }

  // Check if core-config.yaml exists
  const configPath = path.join(bmadCorePath, 'core-config.yaml');
  if (!fs.existsSync(configPath)) {
    return {
      name: projectName,
      path: projectPath,
      detected: false,
      error: 'core-config.yaml not found',
    };
  }

  // Read and parse YAML file
  try {
    const fileContents = fs.readFileSync(configPath, 'utf-8');
    const parsed = yaml.load(fileContents, { schema: yaml.CORE_SCHEMA });

    // Validate parsed config
    if (!validateProjectConfig(parsed)) {
      return {
        name: projectName,
        path: projectPath,
        detected: false,
        error: 'Invalid config structure: missing required fields',
      };
    }

    // Success - valid BMAD project detected
    return {
      name: projectName,
      path: projectPath,
      detected: true,
      config: parsed,
    };
  } catch (error) {
    // YAML parsing error or file read error
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      name: projectName,
      path: projectPath,
      detected: false,
      error: `Invalid YAML: ${errorMessage}`,
    };
  }
}
