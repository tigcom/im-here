import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const auditScript = path.join(
  homedir(),
  '.agent-rules',
  'high-end-landing',
  'scripts',
  'anti-slop-audit.mjs',
);

if (!existsSync(auditScript)) {
  console.error(`Không tìm thấy bộ kiểm định giao diện: ${auditScript}`);
  process.exit(1);
}

const projectPath = process.argv[2] || '.';
const result = spawnSync(process.execPath, [auditScript, projectPath], { stdio: 'inherit' });
process.exit(result.status ?? 1);
