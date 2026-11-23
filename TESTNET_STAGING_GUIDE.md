# 🛡️ دليل ضبط بيئات الفحص (Testnets) ومنع الـ Mainnet في GitHub CI/CD

هذا الدليل يوضح لكِ بالتفصيل كيف تضبطين بيئات الفحص (Testnets) وتمنعين الاختبار على الـ Mainnet تماماً، مع استخدام صنابير الأموال المجانية (Faucets) في **GitHub Actions** كبيئة **Staging** قبل النشر على أي سيرفر إنتاجي في المستقبل.

---

## 1. ما هي شبكات الفحص الثلاثة (Testnets) وأين تحصلي على أموالها مجاناً؟

| الشبكة (Testnet) | الاستخدام | معرف السلسلة (Chain ID) | رابط الصنبور المجاني (Free Faucet) |
|---|---|---|---|
| **Polygon Amoy** | بديلة شبكة Mumbai لاختبار عقود Polygon | `80002` | [Polygon Faucet](https://faucet.polygon.technology/) |
| **Avalanche Fuji** | شبكة فحص عقود وتطبيقات Avalanche C-Chain | `43113` | [Avalanche Fuji Faucet](https://faucet.avax.network/) |
| **Solana Devnet** | بيئة فحص برامج Solana وتطبيقات Rust | `devnet` (Cluster) | [Solana Faucet](https://faucet.solana.com/) أو عبر الأمر: `solana airdrop 2` |

> 💡 **ملاحظة أمان هامة:** كل العملات الموجودة على هذه الشبكات (tPOL, tAVAX, Devnet SOL) هي **أموال وهمية مجانية للأغراض التجريبية فقط**، وليس لها أي قيمة مالية حقيقية.

---

## 2. المنظومة المعمارية لمنع الـ Mainnet (The Guardrail Architecture)

لمنع أي خطأ بشري قد يؤدي لاختبار كود أو سحب غاز حقيقي من الـ Mainnet، تم إنشاء حاجز أمان برمجي (**Network Guardrail**) يعمل على مستويين:

```
[ Git Push / PR إلى GitHub ]
             │
             ▼
┌───────────────────────────────────────────────┐
│     GitHub Actions (Staging Pipeline)         │
│                                               │
│  1. فحص حاجز الأمان البرمجي (Guardrail Check):│
│     - هل الـ Chain ID = 137 أو 43114 أو 1؟     │
│       ❌ لو نعم: إيقاف فوري للعملية وفشل الـ CI │
│     - هل الـ Chain ID = 80002 أو 43113؟        │
│       ✅ لو نعم: الاستمرار                     │
│                                               │
│  2. تشغيل الاختبارات على شبكة الموك المحلية   │
│     (Local Hardhat / Mock Sandbox - مجاناً)   │
│                                               │
│  3. نشر واختبار تفاعلي على Amoy & Fuji        │
│     باستخدام أموال الـ Faucet المجانية        │
└───────────────────────┬───────────────────────┘
                        │
       ✅ لو كل الاختبارات نجحت فقط!
                        ▼
┌───────────────────────────────────────────────┐
│  السيرفر المستقبلي / الإنتاج (Production)     │
└───────────────────────────────────────────────┘
```

---

## 3. الملفات المنفذة والموجودة في مشروعك الآن

1. **`web3-guardrail/scripts/network-guardrail.js`**: سكربت يتحقق من الـ Chain ID ورابط الـ RPC، ويوقف أي محاولة اتصال بالـ Mainnet فوراً.
2. **`web3-guardrail/hardhat.config.js`**: ملف إعدادات Hardhat يقتصر على شبكات `amoy` و `fuji` والشبكة المحلية `hardhat` ويحذف أي مسار للـ Mainnet.
3. **`.github/workflows/staging-testnet.yml`**: سكربت الـ CI/CD الذي يشغّل الفحص تلقائياً عند كل رفع على GitHub.

---

## 4. خطوات التفعيل على GitHub خطوة بخطوة

### الخطوة 1: إنشاء محفظة مخصصة للفحص فقط (Burner Wallet)
* افتحي محفظة MetaMask وأنشئي حساباً جديداً باسم **"Staging Testnet Deployer"**.
* ⚠️ **تحذير:** لا تضعي في هذه المحفظة أي أموال حقيقية نهائياً.
* اذهبي للروابط المجانية أعلاه وضعي عنوان محفظتك واحصلي على tPOL و tAVAX مجاناً.
* انسخي المفتاح الخاص (Private Key) لهذه المحفظة التجريبية.

### الخطوة 2: إضافة المفتاح في GitHub Secrets
1. في مستودع مشروعك على GitHub، اذهبي إلى: **Settings** -> **Secrets and variables** -> **Actions**.
2. اضغطي **New repository secret**.
3. أضيفي المتغير التالي:
   * **Name:** `TESTNET_PRIVATE_KEY`
   * **Value:** الصقي المفتاح الخاص للمحفظة التجريبية.
4. (اختياري) يمكنك أيضاً إضافة روابط RPC مخصصة:
   * `POLYGON_AMOY_RPC`: `https://rpc-amoy.polygon.technology`
   * `AVALANCHE_FUJI_RPC`: `https://api.avax-test.network/ext/bc/C/rpc`

### الخطوة 3: تجربة الرفع
بمجرد عمل:
```bash
git add .
git commit -m "feat: enforce testnet guardrails"
git push origin staging
```
سيقوم GitHub Actions بتشغيل الـ Workflow فوراً، وسيقوم بفحص حاجز الأمان والتأكد من خلو المشروع من أي إعدادات Mainnet، وتشغيل الفحوصات في بيئة الـ Staging مجاناً!
