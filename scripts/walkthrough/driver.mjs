// Minimal stdio client for @playwright/mcp, for scripted walkthroughs.
import { spawn } from 'node:child_process';
export async function startSession({ headless = true } = {}) {
  const args = ['-y', '@playwright/mcp@0.0.86', '--isolated', '--browser', 'chrome'];
  if (headless) args.push('--headless');
  const child = spawn('npx', args, { stdio: ['pipe', 'pipe', 'ignore'] });
  let buf = ''; const waiters = new Map(); let id = 0;
  child.stdout.on('data', (d) => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const line = buf.slice(0, i); buf = buf.slice(i + 1); if (line.trim()) { const msg = JSON.parse(line); waiters.get(msg.id)?.(msg); } } });
  const rpc = (method, params) => new Promise((res) => { const n = ++id; waiters.set(n, res); child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: n, method, params }) + '\n'); });
  await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'walkthrough', version: '1' } });
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  const tool = async (name, args = {}) => {
    const r = await rpc('tools/call', { name, arguments: args });
    const text = r.result?.content?.map((c) => c.text ?? '').join('\n') ?? '';
    if (r.error || r.result?.isError) throw new Error(`${name} failed: ${text || JSON.stringify(r.error)}`);
    return text;
  };
  const s = {
    tool,
    snapshot: () => tool('browser_snapshot'),
    async ref(pattern) {
      const snap = await s.snapshot();
      const line = snap.split('\n').find((l) => pattern.test(l) && /\[ref=/.test(l));
      if (!line) throw new Error(`No element matching ${pattern}`);
      return { target: line.match(/\[ref=([^\]]+)\]/)[1], element: line.trim().slice(0, 80) };
    },
    async click(pattern) { const t = await s.ref(pattern); return tool('browser_click', t); },
    async has(pattern) { return pattern.test(await s.snapshot()); },
    async solveParentGate() {
      const snap = await s.snapshot();
      const m = snap.match(/(\d+) \+ (\d+) = \?/);
      if (!m) throw new Error('Parent gate question not found');
      await s.click(new RegExp(`button "${Number(m[1]) + Number(m[2])}"`));
    },
    async errors() { const text = await tool('browser_console_messages', { level: 'error', all: true }); const n = Number(text.match(/Errors: (\d+)/)?.[1] ?? 0); return { count: n, text }; },
    close: async () => { await tool('browser_close').catch(() => {}); child.kill(); },
  };
  return s;
}
export function report() {
  const results = [];
  return {
    async step(name, fn) { try { await fn(); results.push(`PASS ${name}`); } catch (e) { results.push(`FAIL ${name}: ${e.message.split('\n')[0].slice(0, 200)}`); } },
    print() { console.log(results.join('\n')); return results.every((r) => r.startsWith('PASS')); },
  };
}
