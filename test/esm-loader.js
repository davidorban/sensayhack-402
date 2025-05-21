// Custom ESM loader for Mocha
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Store the original import
const originalImport = process[Symbol.for('ts-node.exports.originalImport')];

// Custom import function
async function customImport(specifier, context, nextResolve) {
  return nextResolve(specifier, context);
}

// Custom load function
async function customLoad(url, context, nextLoad) {
  try {
    const filePath = fileURLToPath(url);
    const source = readFileSync(filePath, 'utf8');
    
    return {
      format: 'module',
      shortCircuit: true,
      source: source,
    };
  } catch (error) {
    return nextLoad(url, context);
  }
}

export { customImport as resolve, customLoad as load };
