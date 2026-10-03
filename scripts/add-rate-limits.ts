import fs from 'fs';
import path from 'path';

function walk(dir: string, filelist: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      walk(filepath, filelist);
    } else if (filepath.endsWith('route.ts')) {
      filelist.push(filepath);
    }
  }
  return filelist;
}

const adminRoutes = walk(path.join(process.cwd(), 'src/app/api/admin'));

for (const route of adminRoutes) {
  let content = fs.readFileSync(route, 'utf-8');
  let changed = false;

  // Add import if missing and if we are going to use it
  if (!content.includes('enforceRateLimit')) {
    const methods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    let methodFound = false;
    
    for (const method of methods) {
      const regex = new RegExp(`export async function ${method}\\(([^)]+)\\) {`, 'g');
      content = content.replace(regex, (match, args) => {
        methodFound = true;
        // The first argument is usually `request: Request` or `_request: Request`
        const reqArgMatch = args.match(/([a-zA-Z0-9_]+)\s*:\s*Request/);
        const reqVar = reqArgMatch ? reqArgMatch[1] : 'request';
        return `${match}\n  if (!await enforceRateLimit(${reqVar}, 'admin-write', 60)) return NextResponse.json({ message: 'Too many requests' }, { status: 429 })`;
      });
    }

    if (methodFound) {
      // Add import at the top
      content = `import { enforceRateLimit } from '@/lib/rate-limit'\n` + content;
      
      // Since some endpoints might not have NextResponse imported if they return plain Response,
      // but most use NextResponse. We assume NextResponse is there or will be fine.
      if (!content.includes('NextResponse')) {
          content = `import { NextResponse } from 'next/server'\n` + content;
      }
      
      fs.writeFileSync(route, content, 'utf-8');
      console.log(`Updated ${route}`);
    }
  }
}
