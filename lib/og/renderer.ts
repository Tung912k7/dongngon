import { createRenderer } from '@ogify/core';
import { getBrutalistWorkTemplate } from './templates';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Helper to get local font as ArrayBuffer
export async function getLocalFont(fontPath: string): Promise<ArrayBuffer> {
  const absolutePath = join(process.cwd(), 'public', fontPath);
  const buffer = await readFile(absolutePath);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

// Function to handle async registration
export async function getOGRenderer() {
  const brutalistWorkTemplate = await getBrutalistWorkTemplate();
  
  return createRenderer({
    templates: {
      'brutalist-work': brutalistWorkTemplate,
    },
  });
}
