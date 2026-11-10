# YEARS-PLAN — Dashboard แผนงานปี 2570 (CMNH)

Dashboard ติดตามแผนงานปี 2570: ภาพรวมตัวเลขหลัก · ตารางงานรายไตรมาส (20 งาน) · 6 โปรเจ็คต่อเนื่อง · KPI 17 ตัว พร้อมช่องกรอกผลจริงรายเดือน · เรื่องที่ต้องให้ CEO ตัดสินใจ

- **หน้าเว็บ**: GitHub Pages (static) — `public/`
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

ใน Supabase Dashboard → Authentication → URL Configuration ใส่ URL ของหน้าเว็บ `https://md-cmnh.github.io/YEARS-PLAN/` เป็น Site URL และ Redirect URL

### 2. GitHub Pages

1. Settings → Pages → Source เลือก **GitHub Actions**
2. Settings → Secrets and variables → Actions → แท็บ **Variables** เพิ่ม
   - `SUPABASE_URL` เช่น `https://<ref>.supabase.co`
   - `SUPABASE_ANON_KEY` (Project Settings → API → anon / publishable key, เปิดเผยได้เพราะทุกตารางมี RLS)
3. Merge เข้า `main` (หรือกด Run workflow ที่ Actions → "Deploy dashboard to GitHub Pages")

หมายเหตุ: หน้าเว็บบน GitHub Pages เปิดให้ทุกคนเข้าถึงได้ แต่ข้อมูลอ่านได้เฉพาะคนที่ล็อกอินและอยู่ใน `allowed_users` เท่านั้น ถ้า repo เป็น private ต้องใช้ GitHub แพ็กเกจที่รองรับ Pages สำหรับ private repo

## พัฒนาบนเครื่อง

ใส่ค่าใน `public/config.js` (อย่า commit) แล้วเปิด

```bash
npx serve public
```
