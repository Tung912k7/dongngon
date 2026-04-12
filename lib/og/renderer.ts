import { createRenderer } from '@ogify/core';
import fs from 'fs';
import path from 'path';
import { getBrutalistWorkTemplate } from './templates';

// Helper to get local font as ArrayBuffer
export async function getLocalFont(fontPath: string): Promise<ArrayBuffer> {
  const absolutePath = path.join(process.cwd(), 'public', fontPath);
  const fontFile = fs.readFileSync(absolutePath);
  return fontFile.buffer.slice(fontFile.byteOffset, fontFile.byteOffset + fontFile.byteLength);
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
