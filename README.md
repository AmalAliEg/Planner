# ⚡ مخطط الإنجاز التكيفي (Adaptive Planner)
نظام الجدولة الذكية وإدارة التعلم القائم على وكيلين متكاملين (Two-Agent Architecture) مع حساب فلكي دقيق لمواقيت الصلاة بالجيزة وتخزين سحابي لحظي عبر Firebase Realtime Database.

---

## 🚀 التشغيل السريع (Quick Start)
1. شغلي الملف `run.bat` أو افتحي `index.html` في أي متصفح (Chrome أو Edge موصى بهما).
2. التطبيق يعمل كـ **PWA**: يمكنك تثبيته مباشرة على الهاتف أو الديسكتوب بالضغط على زر "تثبيت التطبيق".
3. يعمل **Online و Offline**: في حال انقطاع النت، المحرك الفلكي يحسب مواقيت الصلاة بدقة دون الحاجة لأي سيرفر.

---

## 🔑 إعداد قواعد حماية Firebase (Security Rules)
لتفعيل القراءة والكتابة للـ Anonymous Auth في Firebase Console لمشروع `planner-c95c5`:
1. ادخلي على [Firebase Console](https://console.firebase.google.com/)
2. اختاري المشروع `planner-c95c5`
3. في القائمة الجانبية: **Build** -> **Authentication** -> تبويب **Sign-in method** -> فعّلي **Anonymous**.
4. في القائمة الجانبية: **Build** -> **Realtime Database** -> تبويب **Rules**، وضعي الكود التالي:

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
5. اضغطي **Publish**.

---

## 🧩 الهيكلية التقنية (Architecture)
- **Agent 1 (Task Manager):** يدير شجرة الكورسات والشباتر (Track -> Course -> Chapter) ويحسب الـ Progress الفعلي من إنجاز الشباتر الذرية.
- **Agent 2 (Scheduler):** يولد الجدول اليومي بـ 24 ساعة بدقة 12 ساعة (ص/م) مربوطاً بمواقيت صلوات الجيزة الفلكية والرجوع من الـ ITI.
- **Astronomical Prayer Engine:** محرك فلكي مبني داخلياً وفقاً لهيئة المساحة المصرية (الفجر 19.5°، العشاء 17.5°).
- **Elite UI System:** مزود بجميع المكونات الاحترافية (Scroll Reveal, Before/After, Accordion, Sticky Bottom Bar, System Status Indicator).
