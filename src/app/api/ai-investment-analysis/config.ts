import { readFileSync } from 'fs';
import { join } from 'path';

export function getOpenAIApiKey(): string | null {
  // First try environment variable
  if (process.env.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }
  
  // Fallback: read from .env.local file directly
  try {
    const envPath = join(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    const match = envContent.match(/OPENAI_API_KEY=(.+)/);
    if (match) {
      return match[1].trim();
    }
  } catch (error) {
    console.error('Error reading .env.local:', error);
  }
  
  return null;
} 