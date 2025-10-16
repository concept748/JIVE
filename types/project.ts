/**
 * Project and ProjectConfig interfaces for BMAD project detection
 * Aligned with Architecture v1.1 (docs/architecture.md lines 288-314)
 */

/**
 * Project configuration extracted from .bmad-core/core-config.yaml
 */
export interface ProjectConfig {
  /** Path to PRD file (e.g., "docs/prd.md") */
  prdFile: string;
  /** PRD version (e.g., "v4") */
  prdVersion?: string;
  /** Whether PRD is sharded into multiple files */
  prdSharded: boolean;
  /** Directory path for sharded PRD files (e.g., "docs/prd") */
  prdShardedLocation?: string;

  /** Path to architecture file (e.g., "docs/architecture.md") */
  architectureFile: string;
  /** Architecture version (e.g., "v4") */
  architectureVersion?: string;
  /** Whether architecture is sharded into multiple files */
  architectureSharded: boolean;
  /** Directory path for sharded architecture files (e.g., "docs/architecture") */
  architectureShardedLocation?: string;

  /** Directory path for dev story files (e.g., "docs/stories") */
  devStoryLocation: string;
  /** Directory path for QA results (e.g., "docs/qa") */
  qaLocation: string;
  /** Pattern for epic files (e.g., "epic-{n}*.md") */
  epicFilePattern?: string;
}

/**
 * Project metadata returned by detectBMADProject()
 * Simplified version of full Project model (which includes id, addedAt, lastSeen)
 */
export interface ProjectMetadata {
  /** Project name (extracted from directory path) */
  name: string;
  /** Full path to project root directory */
  path: string;
  /** Whether this is a valid BMAD project */
  detected: boolean;
  /** Parsed project configuration (only present if detected=true) */
  config?: ProjectConfig;
  /** Error message if detection failed or YAML parsing failed */
  error?: string;
}
