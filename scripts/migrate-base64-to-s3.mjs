/**
 * 글 본문에 base64 로 박혀 있는 이미지를 S3 로 옮기고
 * <img src> 를 /api/s3/image?key=... 로 치환한다.
 *
 *   node scripts/migrate-base64-to-s3.mjs --dry     # 변경 없이 계획만 출력
 *   node scripts/migrate-base64-to-s3.mjs           # 실제 실행
 *
 * 사전 조건
 *   1) node scripts/backup-posts.mjs 로 백업을 먼저 뜰 것
 *   2) .env.local 에 SUPABASE_SERVICE_ROLE_KEY 가 있을 것
 *      (POST 에 RLS 가 걸려 있어 공개 키로는 UPDATE 가 막힌다)
 *
 * 원본 바이트를 그대로 올린다. 재인코딩하지 않으므로 화질 손실이 없고,
 * base64 오버헤드(약 33%)와 DB 본문 용량만 사라진다.
 */
import fs from 'node:fs'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'

const DRY = process.argv.includes('--dry')

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n').filter(l => l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const URL_ = env.NEXT_PUBLIC_SUPABASE_URL
const READ_KEY = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const WRITE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = env.NEXT_PUBLIC_S3_BUCKET_NAME

if (!DRY && !WRITE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY 가 .env.local 에 없습니다.')
  console.error('POST 에 RLS 가 걸려 있어 공개 키로는 본문을 수정할 수 없습니다.')
  process.exit(1)
}
if (!fs.existsSync('backups') || fs.readdirSync('backups').length === 0) {
  console.error('backups/ 가 비어 있습니다. 먼저 node scripts/backup-posts.mjs 를 실행하세요.')
  process.exit(1)
}

const readH = { apikey: READ_KEY, Authorization: `Bearer ${READ_KEY}` }
const writeH = {
  apikey: WRITE_KEY,
  Authorization: `Bearer ${WRITE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

const s3 = new S3Client({
  region: env.NEXT_PUBLIC_S3_REGION,
  credentials: { accessKeyId: env.NEXT_PUBLIC_AWS_KEY, secretAccessKey: env.NEXT_PUBLIC_AWS_SECRET },
})

const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp' }

/** 본문 안의 base64 <img src> 를 전부 찾는다 */
function findDataUris(html) {
  return [...html.matchAll(/src="(data:(image\/[a-z+]+);base64,([^"]+))"/gi)]
    .map(m => ({ full: m[1], mime: m[2].toLowerCase(), b64: m[3] }))
}

async function uploadOne({ mime, b64 }) {
  const body = Buffer.from(b64, 'base64')
  const key = `editor/${randomUUID()}.${EXT[mime] ?? 'png'}`
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: mime }))
  return { key, bytes: body.length }
}

const ids = await (await fetch(`${URL_}/rest/v1/POST?select=id,type,title&order=created_at.desc`, { headers: readH })).json()

let scanned = 0, changedPosts = 0, uploaded = 0, uploadedBytes = 0, freedChars = 0
const failures = []

for (const p of ids) {
  scanned++
  const row = (await (await fetch(`${URL_}/rest/v1/POST?id=eq.${p.id}&select=contents`, { headers: readH })).json())[0]
  const html = row?.contents ?? ''
  const hits = findDataUris(html)
  if (hits.length === 0) continue

  const label = `${p.type} ${(p.title ?? '').slice(0, 30)}`
  if (DRY) {
    console.log(`[dry] ${label} — 이미지 ${hits.length}장, 본문 ${Math.round(html.length / 1024)}KB`)
    changedPosts++; uploaded += hits.length
    continue
  }

  let next = html
  try {
    for (const hit of hits) {
      const { key, bytes } = await uploadOne(hit)
      next = next.split(hit.full).join(`/api/s3/image?key=${encodeURIComponent(key)}`)
      uploaded++; uploadedBytes += bytes
    }

    const res = await fetch(`${URL_}/rest/v1/POST?id=eq.${p.id}`, {
      method: 'PATCH', headers: writeH, body: JSON.stringify({ contents: next }),
    })
    const txt = await res.text()
    if (!res.ok || txt === '[]') throw new Error(`DB 갱신 실패 (${res.status}) ${txt.slice(0, 120)}`)

    freedChars += html.length - next.length
    changedPosts++
    console.log(`✓ ${label} — ${hits.length}장, ${Math.round(html.length / 1024)}KB → ${Math.round(next.length / 1024)}KB`)
  } catch (e) {
    failures.push({ id: p.id, title: label, error: String(e.message ?? e) })
    console.error(`✗ ${label} — ${e.message ?? e}`)
  }
}

console.log('\n' + '='.repeat(50))
console.log(DRY ? '[DRY RUN] 실제 변경 없음' : '마이그레이션 완료')
console.log(`  검사한 글      ${scanned}`)
console.log(`  변경된 글      ${changedPosts}`)
console.log(`  옮긴 이미지    ${uploaded}장${DRY ? '' : ` / ${(uploadedBytes / 1024 / 1024).toFixed(1)} MB`}`)
if (!DRY) console.log(`  본문에서 제거  ${(freedChars / 1024 / 1024).toFixed(1)} MB`)
if (failures.length) {
  console.log(`\n실패 ${failures.length}건:`)
  failures.forEach(f => console.log(`  - ${f.title}: ${f.error}`))
  process.exitCode = 1
}
