# Ameen School Hub — Production Setup Guide

## Switching from Demo Accounts to Real School Staff

This guide explains how to remove demo accounts and set up real user accounts
for production use.

---

## Step 1 — Understand the Demo Accounts

The following demo accounts are hardcoded in `src/constants.js` (the `DEMO` array).
They work even without a Supabase connection by bypassing real authentication:

| Email | Password | Role |
|-------|----------|------|
| director@ameen.edu | ameen2026 | director |
| admin@ameen.edu | ameen2026 | admin |
| teacher@ameen.edu | ameen2026 | teacher |
| finance@ameen.edu | ameen2026 | finance |
| registrar@ameen.edu | ameen2026 | registrar |
| housemaster@ameen.edu | ameen2026 | housemaster |
| madrasa@ameen.edu | ameen2026 | madrasa |
| parent@ameen.edu | ameen2026 | parent |
| student@ameen.edu | ameen2026 | student |

> ⚠️ **These accounts must be removed before going live.** Anyone who knows
> the password can log in with any role.

---

## Step 2 — Create Real User Accounts in Supabase

1. Go to your **Supabase Dashboard → Authentication → Users**
2. Click **"Invite user"** (or **"Add user"**) for each real staff member
3. Use their real school email address (e.g. `ahmed.khan@ameenschool.edu.pk`)
4. They will receive an email to set their own password

**Roles available:**
- `director` — Full access, all pages
- `admin` — Almost full access (no financial reports)
- `teacher` — Classroom, marks, attendance, homework
- `finance` — Fee management, salary, donations
- `registrar` — Student records, results, reports
- `housemaster` — House system, HVS, investigations
- `madrasa` — Madrasa / Hifz section only
- `parent` — Parent portal, messaging, homework view
- `student` — Quiz, homework, E-Tube only

---

## Step 3 — Assign Roles to Real Users

The app reads roles from the `DEMO` array in `src/constants.js`. For real users,
you need to store roles in Supabase. Add this table:

```sql
-- Run in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.user_roles (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  role       TEXT NOT NULL DEFAULT 'teacher',
  name       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_auth" ON public.user_roles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insert your real staff
INSERT INTO public.user_roles (email, role, name) VALUES
  ('principal@ameenschool.edu.pk',  'director',    'Principal Sahib'),
  ('ahmed.khan@ameenschool.edu.pk', 'admin',       'Ahmed Khan'),
  ('sara.ali@ameenschool.edu.pk',   'teacher',     'Sara Ali'),
  ('accounts@ameenschool.edu.pk',   'finance',     'Finance Officer');
  -- Add more rows for each staff member
```

---

## Step 4 — Update App.js to Read Roles from Database

Open `src/App.js`. Find this section (around line 458):

```js
const uName = DEMO.find(d => d.email === user?.email)?.name || user?.email || "";
const uRole = DEMO.find(d => d.email === user?.email)?.role || "teacher";
```

Replace with:

```js
// Add this state at the top of the App component:
const [realRole, setRealRole] = useState(null);
const [realName, setRealName] = useState(null);

// Add this useEffect after the auth useEffect:
useEffect(() => {
  if (!user) return;
  supabase
    .from("user_roles")
    .select("role, name")
    .eq("email", user.email)
    .single()
    .then(({ data }) => {
      if (data) {
        setRealRole(data.role);
        setRealName(data.name);
      }
    });
}, [user]);

// Then change uName and uRole to:
const uName = realName || user?.email || "";
const uRole = realRole || "teacher";
```

---

## Step 5 — Remove Demo Accounts from constants.js

Open `src/constants.js`. Find the `DEMO` array (around line 73) and either:

**Option A — Clear it completely (recommended for production):**
```js
const DEMO = [];
```

**Option B — Keep only internal test accounts:**
```js
const DEMO = [
  { email:"test@ameenschool.edu.pk", password:"internal2026", role:"admin", name:"Test Admin" },
];
```

---

## Step 6 — Remove Demo Users from Supabase Auth (if created)

If demo emails were ever used to sign in to Supabase (not just the local bypass):

1. Go to **Supabase Dashboard → Authentication → Users**
2. Search for `@ameen.edu`
3. Click each demo user → **"Delete user"**

---

## Step 7 — Remove Demo Credentials from the Login Page

Open `src/components/auth/Login.js` and **delete lines 40–45** (the demo hint block):

```jsx
{/* DELETE this entire block ↓ */}
<div style={{background:...}}>
  <div style={{...}}>🔑 Demo — Click to log in:</div>
  {DEMO.map(u=><div key={u.email} ... onClick={()=>{setE(u.email);setP(u.password);}}>
    [{u.role}] {u.email} / {u.password}
  </div>)}
</div>
{/* DELETE this entire block ↑ */}
```

Also remove the `DEMO` import at the top of Login.js:
```js
// Remove DEMO from this import:
import { C, S, DEMO } from "../../constants";
// Change to:
import { C, S } from "../../constants";
```

---

## Checklist Before Going Live

- [ ] Real staff accounts created in Supabase Auth
- [ ] `user_roles` table populated with real emails and roles
- [ ] `DEMO` array cleared in `src/constants.js`
- [ ] `uRole` / `uName` reading from database instead of DEMO array
- [ ] Demo users deleted from Supabase Auth
- [ ] Demo credential hints removed from login screen
- [ ] App rebuilt and redeployed (`npm run build`)

---

## Quick Role Reference

| Role | Can Do |
|------|--------|
| director | Everything |
| admin | Everything except financial reports |
| teacher | Marks, attendance, homework, quizzes |
| finance | Fees, salary, donations |
| registrar | Student records, transcripts, results |
| housemaster | Houses, HVS, investigations, watchlist |
| madrasa | Madrasa section, Hifz |
| parent | View results, fees, send messages |
| student | Quiz, homework, E-Tube |

---

*Generated by Ameen School Hub setup assistant.*
