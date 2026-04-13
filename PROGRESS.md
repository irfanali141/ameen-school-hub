# Ameen School Hub — Project Status (Last updated: April 2026)

## About
- **Developer:** Irfan Ali
- **Project:** Ameen Islamic Institute School Management System
- **Started:** March 2026
- **Live URL:** https://ameen-school-hub.vercel.app
- **Stack:** React (CRA), Supabase, Vercel

## Architecture
- `src/App.js` — **770 lines** (NOT 3700+). Single entry point with lazy-loaded pages via React.lazy() + Suspense
- `src/constants.js` — ROLE_PAGES, HOUSES, HVS_CATS, demo credentials, seed data
- `src/contexts/SchoolContext.js` — single source of truth for all shared data (students, hifzLogs, hvs, etc.)
- `src/components/ui/ModuleShell.js` — React Error Boundary wrapping each page
- `src/components/` — 14 folders, ~108 component files
- Roles: director, admin, teacher, finance, registrar, housemaster, madrasa, parent, student

## Modules Wired to Navigation (as of April 2026)
| Module | Page ID | Roles |
|--------|---------|-------|
| Dashboard | dashboard | all |
| Attendance | attendance | admin, teacher, registrar, housemaster |
| Students | students | admin, teacher, registrar, housemaster, madrasa |
| HVS System | hvs | admin, housemaster |
| Hifz Log | hifz | admin, teacher, madrasa |
| Hifz Dashboard | hifzdashboard | admin, teacher, madrasa |
| Madrasa Ustad | madrasaustad | admin, madrasa |
| Awards Hub | awardshub | admin, housemaster |
| Fee Management | fees | admin, finance |
| Houses | houses | admin, housemaster |
| Weekly Duties | duties | admin, housemaster |
| Results/Marks | results, marks | admin, teacher, registrar |
| Teachers | teachers | admin |
| Salary/Slips | salary, slips | admin, finance |
| Timetable | timetable | admin, teacher |
| Analytics | analytics | admin, registrar |
| AI Assistant | aiassistant, aicommand | admin, teacher |
| ... + ~50 more pages | | |

## Recent Fixes (April 2026)
- `AwardsHub.js` — import position fixed, sabaqStreak wired, dead code removed
- `MadrasaUstad.js` — typo `awards_winners` → `award_winners` fixed
- `WeeklyDutyChecklist.js` — `N2 is not defined` runtime error fixed
- `.vercelignore` — added to reduce deploy size (18MB vs 100MB)

## Known Issues / Pending Work
- **Fee Management**: Ledger tab and Outstanding Tracker not yet connected to Supabase
- **AwardsHub**: `top_house_term` category uses week-based calc instead of term-wide data
- **WifaqCompliance**: Still uses old `addData` prop pattern
- **Missing Supabase tables** (SQL not confirmed): award_winners, award_nominations, namaz_attendance, sabaq_logs, tajweed_scores, wifaq_compliance, madrasa_subjects, parent_messages

## Vercel Deployment Method
```bash
vercel build --prod --yes
vercel deploy --prebuilt --prod --yes
```
(Direct `vercel --prod` fails at 100MB; pre-built approach uploads only 18MB)

## Learning Goals
- Learning React/JS while building
- Using Claude as mentor
- Rule: Always ask "why" about every code decision
