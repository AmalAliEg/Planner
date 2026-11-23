# 🏗️ Adaptive Planner — Architecture Document
> Version 1.0 | Planning Phase | Nov 2026

---

## 1. SYSTEM OVERVIEW

```
┌──────────────────────────────────────────────────────────────────┐
│                    ADAPTIVE PLANNER ECOSYSTEM                    │
│                                                                  │
│  ┌─────────────┐    ┌─────────────────┐    ┌────────────────┐  │
│  │  Agent 2    │◄───│   App Shell     │───►│   Agent 1      │  │
│  │ Scheduler   │    │  (UI + Router)  │    │ Task Manager   │  │
│  │  Engine     │    │                 │    │   Engine       │  │
│  └──────┬──────┘    └────────┬────────┘    └───────┬────────┘  │
│         │                   │                      │           │
│         └───────────┬──────────────────────────────┘           │
│                     │                                           │
│              ┌──────▼───────┐                                  │
│              │  Firebase    │                                   │
│              │  Realtime DB │                                   │
│              │  (Cloud)     │                                   │
│              └──────────────┘                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. EERD — Entity Relationship Diagram (Extended)

```
USER ──────1────────────1──── SETTINGS
  │
  │1
  │
  │N
TRACK (Main Category: ITI | CT-GenAI | Spiritual | Project)
  │  name, category, color, icon, estimatedTotalMin, order
  │
  │1
  │N
COURSE (Sub-Track: e.g. "API Testing with Python")
  │  name, description, totalChapters, estimatedMinPerChapter
  │
  │1
  │N
CHAPTER (Atomic Unit: e.g. "Lab 2: Pytest Fixtures")
     name, chapterNumber, estimatedMin, isDone, doneAt, notes

USER ──────1────────────N──── DAILY_PLAN (keyed by date)
  │  strategy, arrivalHour, isFriday, conditions
  │
  │1
  │N
TIME_BLOCK (per plan)
     blockKey, type, name, linkedChapterId, startMin, durationMin, isDone

USER ──────1────────────N──── PRAYER_CACHE (keyed by lat+lng+date)
     fajrMin, dhuhrMin, asrMin, maghribMin, ishaMin, source
```

---

## 3. FIREBASE REALTIME DB SCHEMA (JSON Tree)

```
users/
  {userId}/
    profile/         ← name, email, city, lat, lng, timezone
    settings/        ← strategy, arrivalHour, selectedDate, toggles
    tracks/
      {trackId}/
        name, category, color, icon, order, isActive
        courses/
          {courseId}/
            name, description, totalChapters, estimatedMinPerChapter
            chapters/
              {chapterId}/
                name, chapterNumber, estimatedMin, isDone, doneAt, notes
    dailyPlans/
      {YYYY-MM-DD}/
        strategy, arrivalHour, conditions (isFriday, isExhausted...)
        blocks/
          {blockKey}/
            isDone, doneAt
    prayerCache/
      {lat_lng_date}/
        fajrMin, dhuhrMin, asrMin, maghribMin, ishaMin, source
```

---

## 4. FIREBASE SECURITY RULES

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "auth != null && auth.uid === $userId",
        ".write": "auth != null && auth.uid === $userId"
      }
    }
  }
}
```

**Phase 1 MVP (before Auth):** Use Anonymous Auth so each device gets a stable uid without login.

---

## 5. FEATURE ROADMAP

### Phase 1 — MVP (Now, Single File)
- [x] Astronomical prayer engine (Giza offline)
- [x] Dynamic 24h scheduler (arrival-based, prayer-anchored)
- [x] Task tree: Track → Course → Chapter (3 levels, each with checkbox)
- [x] Firebase RTDB persistence (not localStorage)
- [x] PWA installable, offline-capable via Service Worker
- [x] Mobile-first bottom nav + Elite UI

### Phase 2 — Multi-User App (3 months)
- [ ] Firebase Auth (Google + Email)
- [ ] City-based prayer configuration
- [ ] Exam reminders via Push Notifications
- [ ] Analytics & Progress Dashboard

### Phase 3 — Native App (6 months)
- [ ] Capacitor → Android APK / iOS IPA
- [ ] Home screen widgets
- [ ] AI-powered rescheduling via Gemini API

---

## 6. TECH STACK

| Layer | Phase 1 (Now) | Phase 2+ |
|---|---|---|
| Frontend | Vanilla HTML+JS + CDN Tailwind | React + Vite + Tailwind |
| Database | Firebase Realtime DB | Firestore (at scale) |
| Auth | Firebase Anonymous Auth | Firebase Auth (Google) |
| Mobile | PWA | Capacitor → APK/IPA |
| Hosting | Firebase Hosting | Same |

---

## 7. CODE PRINCIPLES

1. JSDoc on every function (WHY not just WHAT)
2. Single Responsibility per module/function
3. No magic numbers — all constants named
4. Data-down, events-up pattern
5. Firebase writes batched to minimize cost
6. Offline-first: Astronomical engine works without network
