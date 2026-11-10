# YEARS-PLAN — Dashboard แผนงานปี 2570 (CMNH)

Dashboard ติดตามแผนงานปี 2570: ภาพรวมตัวเลขหลัก · ตารางงานรายไตรมาส (20 งาน) · 6 โปรเจ็คต่อเนื่อง · KPI 17 ตัว พร้อมช่องกรอกผลจริงรายเดือน · เรื่องที่ต้องให้ CEO ตัดสินใจ

- **หน้าเว็บ**: Cloudflare Workers (static assets) — `public/` + `src/worker.js`
- **ข้อมูล**: Supabase (Postgres + Auth แบบ magic link) — `supabase/`
- ข้อมูลตั้งต้นมาจากเอกสาร "แผนงานปี 2570 (2027) — CMNH" (`supabase/seed.sql`)

## สิทธิ์การเข้าถึง

ทุกตารางเปิด Row Level Security เฉพาะผู้ที่ล็อกอินและมีอีเมลอยู่ในตาราง `allowed_users` เท่านั้นที่อ่านข้อมูลได้
- `role = 'viewer'` อ่านอย่างเดียว
- `role = 'editor'` แก้สถานะงาน / หมายเหตุ / KPI / ผลจริงได้

ใครไม่อยู่ในรายชื่อ ล็อกอินได้แต่จะไม่เห็นข้อมูลใด ๆ

## ตั้งค่าครั้งแรก

### 1. Supabase

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push            # สร้างตาราง + RLS
npx supabase db execute -f supabase/seed.sql   # หรือวาง seed.sql ใน SQL Editor
```

เพิ่มผู้มีสิทธิ์ (SQL Editor):

```sql
insert into public.allowed_users (email, role) values ('someone@example.com', 'editor');
```

ใน Supabase Dashboard → Authentication → URL Configuration ใส่ URL ของ Worker (เช่น `https://years-plan-dashboard.<subdomain>.workers.dev`) เป็น Site URL / Redirect URL

### 2. Cloudflare

ใส่ `SUPABASE_URL` และ `SUPABASE_ANON_KEY` (Project Settings → API) ใน `wrangler.jsonc` → `vars` แล้ว

```bash
npm install
npx wrangler login
npm run deploy
```

หรือ deploy อัตโนมัติด้วย GitHub Actions (`.github/workflows/deploy.yml`) เมื่อ push เข้า `main`:
- Secrets: `CLOUDFLARE_API_TOKEN` (สิทธิ์ Workers Scripts: Edit), `CLOUDFLARE_ACCOUNT_ID`
- Variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`

## พัฒนาบนเครื่อง

```bash
npx wrangler dev --var SUPABASE_URL:https://<ref>.supabase.co --var SUPABASE_ANON_KEY:<anon-key>
```
