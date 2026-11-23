# 🏗️ Adaptive Planner — Architecture & Normalized Schema Document
> Version 2.0 | Normalized Schema & Discrete Task Architecture | Nov 2026

---

## 1. SYSTEM OVERVIEW & ARCHITECTURE

```
┌────────────────────────────────────────────────────────────────────────┐
│                      ADAPTIVE PLANNER ECOSYSTEM                        │
│                                                                        │
│   ┌──────────────┐     ┌─────────────────────┐     ┌───────────────┐   │
│   │   Agent 2    │◄────│     App Shell       │────►│    Agent 1    │   │
│   │  Scheduler   │     │ (Dashboard & UI)    │     │  Task Manager │   │
│   │ Discrete 24h │     │                     │     │  & Hierarchy  │   │
│   └──────┬───────┘     └──────────┬──────────┘     └───────┬───────┘   │
│          │                        │                        │           │
│          └────────────┬───────────┴───────────┬────────────┘           │
│                       │                       │                        │
│                ┌──────▼────────┐       ┌──────▼────────┐               │
│                │  taskTypes    │       │ taskHierarchy │               │
│                │ (Types Table) │       │ (Track/Course)│               │
│                └───────────────┘       └───────────────┘               │
│                       │                       │                        │
│                ┌──────▼────────┐       ┌──────▼────────┐               │
│                │  dailyPlans   │       │     users     │               │
│                │ (By Date)     │       │ (Profile/Cfg) │               │
│                └───────────────┘       └───────────────┘               │
│                                                                        │
│                   FIREBASE REALTIME DB (CLOUD ROOT)                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. NORMALIZED FIREBASE REALTIME DB SCHEMA (Root Tables)

Instead of nesting everything under `/users/{uid}`, the database is normalized into 4 independent, readable root collections:

### Table 1: `/users`
Stores user profile, global settings, and active preferences:
```json
{
  "users": {
    "zo7CiltDVzUVbVHWhPFFaxMQr9s1": {
      "settings": {
        "strategy": "B",
        "arrivalHour": 15.0,
        "isFriday": false,
        "isExhausted": false,
        "isMomOuting": false,
        "isNoWork": false,
        "selectedDate": "2026-11-23",
        "lastUpdated": 1795405098690
      }
    }
  }
}
```

### Table 2: `/taskTypes`
Master table for block types and categories. The user has full CRUD control (Add/Edit/Delete):
```json
{
  "taskTypes": {
    "type_prayer":    { "id": "type_prayer",    "name": "صلوات وفروض",   "color": "amber",   "icon": "🕌", "isSystem": true },
    "type_commute":   { "id": "type_commute",   "name": "مواصلات وتنقل", "color": "indigo",  "icon": "🚌", "isSystem": true },
    "type_study":     { "id": "type_study",     "name": "مذاكرة وسيلبس", "color": "emerald", "icon": "📚", "isSystem": true },
    "type_lab":       { "id": "type_lab",       "name": "لابات وتطبيق",  "color": "blue",    "icon": "💻", "isSystem": true },
    "type_family":    { "id": "type_family",    "name": "وقت الوالدة ❤️", "color": "rose",    "icon": "❤️", "isSystem": true },
    "type_spiritual": { "id": "type_spiritual", "name": "بحث ديني",     "color": "teal",    "icon": "📖", "isSystem": true },
    "type_work":      { "id": "type_work",      "name": "شغل وفريلانس",  "color": "amber",   "icon": "💼", "isSystem": true },
    "type_rest":      { "id": "type_rest",      "name": "راحة ونوم",     "color": "purple",  "icon": "😴", "isSystem": true },
    "type_routine":   { "id": "type_routine",   "name": "روتين وتجهيز",  "color": "slate",   "icon": "⚙️", "isSystem": true },
    "type_audio":     { "id": "type_audio",     "name": "صوتيات وبودكاست", "color": "violet", "icon": "🎧", "isSystem": true }
  }
}
```

### Table 3: `/taskHierarchy`
Strict 3-level normalized tree:
**Parent Track -> Child Course -> Child Chapter/Lab**
- **Course Duration Flexibility:** `planningMode` can be `lectures` (بعدد المحاضرات) OR `days` (بعدد الأيام).
- **Chapter Precision:** Exact `durationHours` and `durationMinutes`.
- **Labs & Deadlines:** `isLab: true`, `dueDate: "2026-11-28T18:00"`, with automated Calendar (.ics) generation & 2-day reminder alarm.
- **Resource Link:** `resourceLink: "https://..."` for books, PDFs, and podcasts.

```json
{
  "taskHierarchy": {
    "track_iti": {
      "id": "track_iti",
      "name": "ITI Testing Track",
      "category": "ITI",
      "typeId": "type_lab",
      "icon": "🎓",
      "courses": {
        "course_api_testing": {
          "id": "course_api_testing",
          "name": "API Testing with Python & Pytest",
          "planningMode": "lectures",
          "totalLectures": 4,
          "totalDays": 14,
          "chapters": {
            "chap_api_lab1": {
              "id": "chap_api_lab1",
              "name": "Lab 1: CRUD Endpoints Validation",
              "durationHours": 1,
              "durationMinutes": 30,
              "estimatedMin": 90,
              "isLab": true,
              "dueDate": "2026-11-25T18:00",
              "resourceLink": "https://github.com",
              "isDone": true,
              "doneAt": 1795405098690
            }
          }
        }
      }
    }
  }
}
```

### Table 4: `/dailyPlans`
Stores daily schedule completion states indexed by date (`YYYY-MM-DD`):
```json
{
  "dailyPlans": {
    "2026-11-23": {
      "snapshot": { "arrivalHour": 15.0, "strategy": "B" },
      "blocks": {
        "blk-commute-go-transit": { "isDone": true, "doneAt": 1795405098 },
        "blk-commute-go-podcasts": { "isDone": true, "doneAt": 1795405099 },
        "blk-commute-go-english": { "isDone": false }
      }
    }
  }
}
```

---

## 3. FIREBASE SECURITY RULES FOR NORMALIZED SCHEMA

```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $userId"
      }
    },
    "taskTypes": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "taskHierarchy": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "dailyPlans": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "prayerCache": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

---

## 4. MATHEMATICAL DISCRETE SCHEDULE DESIGN (24.00-Hour Invariant)

Every single daily task is a **separate discrete line item**:
- **Morning Commute:**
  1. `مواصلات رايح (المترو / النقل الجماعي)` (40m)
  2. `استماع بودكاست الذكاء الاصطناعي (AI Podcasts)` (45m) [🔗 رابط البودكاست]
  3. `تدريب التحدث والإنجليزي (English Shadowing)` (35m) [🔗 رابط التدريب]
- **Return Commute:**
  1. `مواصلات راجع من دوام الـ ITI` (49m)
  2. `استماع صوتيات وسلاسل البحث الديني الفكري` (41m) [🔗 رابط المرجع]
- **Arrival & Home:**
  1. `وصول البيت واستقبال الوالدة والاطمئنان عليها ❤️` (15m)
  2. `غداء عائلي دافئ وسوالف مع الوالدة ❤️` (35m)
  3. `جلسة مذاكرة مبكرة CT-GenAI` أو `قيلولة تعافي وشحن طاقة`
- **Prayer Anchors:** Calculated for Giza (Egyptian Survey Authority: Fajr 19.5°, Isha 17.5°).
