// Custom loader for Mocha to handle ES modules
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

export async function resolve(specifier, context, nextResolve) {
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  // Skip if not a JavaScript file
  if (!url.endsWith('.js')) {
    return nextLoad(url, context);
  }

  try {
    // Read the file content
    const filePath = fileURLToPath(url);
    const source = await readFile(filePath, 'utf8');
    
    return {
      format: 'module',
      shortCircuit: true,
      source: source,
    };
  } catch (error) {
    // If there's an error, let the default loader handle it
    return nextLoad(url, context);
  }
}
