/**
 * @fileoverview Dependency updater for Java projects (Gradle and Maven).
 * @module @dinoconfig/cli/dependency-updater
 *
 * This module handles adding required dependencies to Java build files
 * when generating model classes that require external libraries like Jackson.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Required dependencies for generated Java models.
 */
export interface RequiredDependency {
  /** Maven group ID */
  groupId: string;
  /** Maven artifact ID */
  artifactId: string;
  /** Version (can be a variable reference for Gradle) */
  version: string;
  /** Dependency scope (implementation, api, compile, etc.) */
  scope: 'implementation' | 'api' | 'compile';
}

/**
 * Result of dependency update operation.
 */
export interface DependencyUpdateResult {
  /** Whether the update was successful */
  success: boolean;
  /** Type of project detected */
  projectType?: 'gradle' | 'maven' | 'unknown';
  /** Path to the build file that was updated */
  buildFilePath?: string;
  /** Dependencies that were added */
  addedDependencies?: string[];
  /** Dependencies that were already present */
  existingDependencies?: string[];
  /** Error message if failed */
  error?: string;
  /** Warning messages */
  warnings?: string[];
}

/**
 * Jackson dependencies required for generated models.
 */
const JACKSON_DEPENDENCIES: RequiredDependency[] = [
  {
    groupId: 'com.fasterxml.jackson.core',
    artifactId: 'jackson-databind',
    version: '2.16.1',
    scope: 'implementation',
  },
  {
    groupId: 'com.fasterxml.jackson.core',
    artifactId: 'jackson-annotations',
    version: '2.16.1',
    scope: 'implementation',
  },
];

/**
 * Finds the project root by traversing up from the output directory
 * looking for build.gradle, build.gradle.kts, or pom.xml.
 */
function findProjectRoot(startPath: string): { projectRoot: string; buildFile: string; projectType: 'gradle' | 'maven' } | null {
  let currentPath = path.resolve(startPath);
  const maxDepth = 10; // Prevent infinite loops
  let depth = 0;

  while (depth < maxDepth) {
    // Check for Gradle (Groovy DSL)
    const gradleFile = path.join(currentPath, 'build.gradle');
    if (fs.existsSync(gradleFile)) {
      return { projectRoot: currentPath, buildFile: gradleFile, projectType: 'gradle' };
    }

    // Check for Gradle (Kotlin DSL)
    const gradleKtsFile = path.join(currentPath, 'build.gradle.kts');
    if (fs.existsSync(gradleKtsFile)) {
      return { projectRoot: currentPath, buildFile: gradleKtsFile, projectType: 'gradle' };
    }

    // Check for Maven
    const pomFile = path.join(currentPath, 'pom.xml');
    if (fs.existsSync(pomFile)) {
      return { projectRoot: currentPath, buildFile: pomFile, projectType: 'maven' };
    }

    // Move up one directory
    const parentPath = path.dirname(currentPath);
    if (parentPath === currentPath) {
      // Reached filesystem root
      break;
    }
    currentPath = parentPath;
    depth++;
  }

  return null;
}

/**
 * Checks if a Gradle build file already contains a dependency.
 */
function gradleHasDependency(content: string, dep: RequiredDependency): boolean {
  // Check for various Gradle dependency declaration formats
  const patterns = [
    // Standard format: implementation 'group:artifact:version'
    new RegExp(`['"]${escapeRegex(dep.groupId)}:${escapeRegex(dep.artifactId)}:[^'"]+['"]`),
    // Without version (e.g., using BOM or version catalog)
    new RegExp(`['"]${escapeRegex(dep.groupId)}:${escapeRegex(dep.artifactId)}['"]`),
    // Gradle Kotlin DSL format
    new RegExp(`"${escapeRegex(dep.groupId)}:${escapeRegex(dep.artifactId)}:[^"]+"`),
  ];

  return patterns.some(pattern => pattern.test(content));
}

/**
 * Checks if a Maven pom.xml already contains a dependency.
 */
function mavenHasDependency(content: string, dep: RequiredDependency): boolean {
  // Simple regex check for dependency in pom.xml
  const groupPattern = `<groupId>${escapeRegex(dep.groupId)}</groupId>`;
  const artifactPattern = `<artifactId>${escapeRegex(dep.artifactId)}</artifactId>`;

  return content.includes(dep.groupId) &&
         content.includes(dep.artifactId) &&
         new RegExp(groupPattern).test(content) &&
         new RegExp(artifactPattern).test(content);
}

/**
 * Escapes special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Adds dependencies to a Gradle build file.
 */
function addGradleDependencies(
  content: string,
  dependencies: RequiredDependency[],
  isKotlinDsl: boolean
): { content: string; added: string[]; existing: string[] } {
  const added: string[] = [];
  const existing: string[] = [];

  for (const dep of dependencies) {
    const depString = `${dep.groupId}:${dep.artifactId}`;

    if (gradleHasDependency(content, dep)) {
      existing.push(depString);
      continue;
    }

    // Find the dependencies block
    const dependenciesBlockRegex = /dependencies\s*\{/;
    const match = dependenciesBlockRegex.exec(content);

    if (match) {
      const insertIndex = match.index + match[0].length;
      const quote = isKotlinDsl ? '"' : "'";
      const newDep = `\n    ${dep.scope}(${quote}${dep.groupId}:${dep.artifactId}:${dep.version}${quote})`;

      content = content.slice(0, insertIndex) + newDep + content.slice(insertIndex);
      added.push(depString);
    }
  }

  return { content, added, existing };
}

/**
 * Adds dependencies to a Maven pom.xml file.
 */
function addMavenDependencies(
  content: string,
  dependencies: RequiredDependency[]
): { content: string; added: string[]; existing: string[] } {
  const added: string[] = [];
  const existing: string[] = [];

  for (const dep of dependencies) {
    const depString = `${dep.groupId}:${dep.artifactId}`;

    if (mavenHasDependency(content, dep)) {
      existing.push(depString);
      continue;
    }

    // Find the dependencies section or create one
    const dependenciesTagRegex = /<dependencies>/;
    const match = dependenciesTagRegex.exec(content);

    if (match) {
      const insertIndex = match.index + match[0].length;
      const newDep = `
        <dependency>
            <groupId>${dep.groupId}</groupId>
            <artifactId>${dep.artifactId}</artifactId>
            <version>${dep.version}</version>
        </dependency>`;

      content = content.slice(0, insertIndex) + newDep + content.slice(insertIndex);
      added.push(depString);
    } else {
      // No dependencies section found - need to add one
      // Find </project> tag and insert before it
      const projectEndRegex = /<\/project>/;
      const projectEndMatch = projectEndRegex.exec(content);

      if (projectEndMatch) {
        const insertIndex = projectEndMatch.index;
        const newSection = `
    <dependencies>
        <dependency>
            <groupId>${dep.groupId}</groupId>
            <artifactId>${dep.artifactId}</artifactId>
            <version>${dep.version}</version>
        </dependency>
    </dependencies>
`;
        content = content.slice(0, insertIndex) + newSection + content.slice(insertIndex);
        added.push(depString);
      }
    }
  }

  return { content, added, existing };
}

/**
 * Updates a Java project's build file with required dependencies.
 *
 * @param outputPath - The output directory where models are being generated
 * @param dryRun - If true, returns what would be changed without modifying files
 * @returns Result of the update operation
 *
 * @example
 * ```typescript
 * const result = await updateProjectDependencies('./src/main/java');
 * if (result.success) {
 *   console.log(`Added dependencies: ${result.addedDependencies?.join(', ')}`);
 * }
 * ```
 */
export function updateProjectDependencies(
  outputPath: string,
  dryRun = false
): DependencyUpdateResult {
  const warnings: string[] = [];

  // Find the project root and build file
  const projectInfo = findProjectRoot(outputPath);

  if (!projectInfo) {
    return {
      success: false,
      projectType: 'unknown',
      error: 'Could not find build.gradle, build.gradle.kts, or pom.xml in the project hierarchy. ' +
             'Please manually add the Jackson dependency to your project.',
      warnings: [
        'For Gradle: implementation \'com.fasterxml.jackson.core:jackson-databind:2.16.1\'',
        'For Maven: <dependency><groupId>com.fasterxml.jackson.core</groupId><artifactId>jackson-databind</artifactId><version>2.16.1</version></dependency>',
      ],
    };
  }

  const { projectRoot, buildFile, projectType } = projectInfo;
  const isKotlinDsl = buildFile.endsWith('.kts');

  try {
    const content = fs.readFileSync(buildFile, 'utf-8');
    let result: { content: string; added: string[]; existing: string[] };

    if (projectType === 'gradle') {
      result = addGradleDependencies(content, JACKSON_DEPENDENCIES, isKotlinDsl);
    } else {
      result = addMavenDependencies(content, JACKSON_DEPENDENCIES);
    }

    // Only write if there are changes and not a dry run
    if (result.added.length > 0 && !dryRun) {
      fs.writeFileSync(buildFile, result.content, 'utf-8');
    }

    // Add info about existing dependencies
    if (result.existing.length > 0) {
      warnings.push(`Already present: ${result.existing.join(', ')}`);
    }

    return {
      success: true,
      projectType,
      buildFilePath: buildFile,
      addedDependencies: result.added,
      existingDependencies: result.existing,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      success: false,
      projectType,
      buildFilePath: buildFile,
      error: error instanceof Error ? error.message : 'Failed to update build file',
    };
  }
}

/**
 * Gets the required dependencies for generated Java models.
 * This can be used to inform users what dependencies they need.
 */
export function getRequiredDependencies(): RequiredDependency[] {
  return [...JACKSON_DEPENDENCIES];
}

/**
 * Formats dependencies for display in CLI output.
 */
export function formatDependenciesForDisplay(
  projectType: 'gradle' | 'maven',
  deps: RequiredDependency[] = JACKSON_DEPENDENCIES
): string[] {
  if (projectType === 'gradle') {
    return deps.map(dep =>
      `implementation '${dep.groupId}:${dep.artifactId}:${dep.version}'`
    );
  } else {
    return deps.map(dep =>
      `<dependency>\n  <groupId>${dep.groupId}</groupId>\n  <artifactId>${dep.artifactId}</artifactId>\n  <version>${dep.version}</version>\n</dependency>`
    );
  }
}
