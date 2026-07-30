/**
 * POST 테이블 전체를 로컬 JSON 파일로 백업한다.
 * base64 -> S3 마이그레이션 전에 반드시 먼저 실행할 것.
 *
 *   node scripts/backup-posts.mjs
 *
 * 결과: backups/posts-<타임스탬프>.json
 */
import fs from 'node:fs'
import path from 'node:path'

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n').filter(l => l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const URL_ = env.NEXT_PUBLIC_SUPABASE_URL
const KEY = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY   // 읽기는 공개 키로 충분
const h = { apikey: KEY, Authorization: `Bearer ${KEY}` }

const ids = await (await fetch(`${URL_}/rest/v1/POST?select=id&order=created_at.desc`, { headers: h })).json()
console.log(`글 ${ids.length}건 백업 시작…`)

const rows = []
for (const [i, { id }] of ids.entries()) {
  const r = await fetch(`${URL_}/rest/v1/POST?id=eq.${id}&select=*`, { headers: h })
  const row = (await r.json())[0]
  if (row) rows.push(row)
  if ((i + 1) % 20 === 0) console.log(`  ${i + 1}/${ids.length}`)
}

fs.mkdirSync('backups', { recursive: true })
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const out = path.join('backups', `posts-${stamp}.json`)
fs.writeFileSync(out, JSON.stringify(rows, null, 1))

const bytes = fs.statSync(out).size
console.log(`\n완료: ${out}`)
console.log(`  ${rows.length}건 / ${(bytes / 1024 / 1024).toFixed(1)} MB`)
