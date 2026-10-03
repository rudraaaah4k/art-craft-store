import fs from 'fs'
import path from 'path'

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

const apiRoutes = walk(path.join(process.cwd(), 'src/app/api'));

for (const route of apiRoutes) {
  if (route.includes('webhooks') || route.includes('auth')) continue;
  
  let content = fs.readFileSync(route, 'utf-8');
  let changed = false;

  const methods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  let methodFound = false;
  
  for (const method of methods) {
    const regex = new RegExp(`export async function ${method}\\(([^)]+)\\) {`, 'g');
    content = content.replace(regex, (match, args) => {
      if (content.includes('verifyCsrfOrigin')) return match;
      methodFound = true;
      const reqArgMatch = args.match(/([a-zA-Z0-9_]+)\s*:\s*Request/);
      let reqVar = reqArgMatch ? reqArgMatch[1] : null;
      
      // If we couldn't parse the argument name nicely, fallback to checking if "request" or "_request" is in args
      if (!reqVar) {
        if (args.includes('request: Request')) reqVar = 'request';
        else if (args.includes('_request: Request')) reqVar = '_request';
        else if (args.includes('req: Request')) reqVar = 'req';
        else reqVar = 'request'; // default fallback
      }
      
      return `${match}\n  if (!verifyCsrfOrigin(${reqVar})) return NextResponse.json({ message: 'CSRF verification failed' }, { status: 403 })`;
    });
  }

  if (methodFound && !content.includes('verifyCsrfOrigin')) {
    content = `import { verifyCsrfOrigin } from '@/lib/csrf'\n` + content;
    // ensure NextResponse is imported if we use it
    if (!content.includes('NextResponse')) {
      content = `import { NextResponse } from 'next/server'\n` + content;
    }
    fs.writeFileSync(route, content, 'utf-8');
    console.log(`Secured ${route}`);
  }
}
