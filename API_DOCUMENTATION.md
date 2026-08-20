# Zemam SaaS REST API v1 (B2B Multi-Tenant Platform)
## توثيق واجهة برمجة التطبيقات لمنظومة زمام السحابية

---

### 🏛️ 1. المعمارية المعتمدة للمنظومة (SaaS Architecture)
1. **لوحة تحكم مالك المنصة (`Super Admin` - أنت):** إدارة الشركات المشتركة، تفعيل وتجميد الاشتراكات، وحسابات الـ SaaS.
2. **لوحة تحكم الشركة المستأجرة (`Company Admin` & `Fleet Manager`):** إدارة أسطول الشركة وسائقيها ومهامها.
3. **المركبة:** تُنشأ تابعة تلقائياً لشركة المستخدم وبدون سائق افتراضي (`driverId: null`).
4. **التتبع الهجين (Hybrid Telematics):** تتبع حي عبر هاتف السائق في البداية ◄ الترقية لأجهزة GPS الصلبة.
5. **المهام اللوجستية (Logistics Dispatch):** مهام نقل وتوصيل شحنات وبضائع فعلية يديرها الـ `Fleet Manager`.
6. **الصيانة المترابطة بالمحاسبية (Linked Maintenance):** بلاغ الصيانة يغير حالة المركبة لـ `maintenance` ويرتبط بسجل السائق المعني.
7. **دورة بيانات الـ GPS والضغط (Data Retention & Playback):**
   - **أثناء الرحلة:** بث إحداثيات كل 5 ثوانٍ (`Hot Realtime Data`).
   - **عند انتهاء الرحلة والتسليم:** ضغط النقاط بـ `Turf.js` واحتساب الكيلومترات وتخزين ملخص ومسار الرحلة لإعادة العرض (`Route Playback`).
   - **سياسة الحذف:** حذف النقاط الخام القديمة بعد 30 يوماً بـ `MongoDB TTL Index`.

---

### 📋 2. جدول نقاط النهاية المعتمد (Full Endpoints Reference)

#### أ. المصادقة والجلسات (Auth & Multi-Tenant Session)
- `POST /api/auth/signup` — تسجيل حساب شركة جديد
- `POST /api/auth/login` — تسجيل الدخول وضبط HttpOnly Cookie
- `POST /api/auth/google` — تسجيل الدخول عبر Google OAuth2
- `POST /api/auth/verify-email` — إرسال رمز OTP لاستعادة الحساب
- `POST /api/auth/verify-otp` — التحقق من رمز OTP
- `POST /api/auth/reset-password` — تعيين كلمة المرور الجديدة
- `POST /api/auth/logout` — تسجيل الخروج ومسح الجلسة
- `GET /api/user/me` — استرجاع الجلسة الحالية والدور والشركة

#### ب. إدارة المنصة والشركات (Super Admin - SaaS Controls)
- `GET /api/admin/companies` — عرض الشركات المشتركة وإحصائياتها
- `POST /api/admin/companies` — إضافة شركة جديدة وتحديد خطة الاشتراك
- `PATCH /api/admin/companies/:id/status` — تجميد أو تفعيل اشتراك شركة
- `DELETE /api/admin/companies/:id` — حذف شركة من المنظومة
- `GET /api/admin/platform-analytics` — إحصائيات المنصة الشاملة للمالك

#### ج. أسطول مركبات الشركة (Company Fleet - Vehicles CRUD)
- `GET /api/vehicles` — جلب مركبات الشركة
- `POST /api/vehicles` — إضافة مركبة جديدة تابعة للشركة تلقائياً
- `GET /api/vehicles/:id` — تفاصيل مركبة محددة
- `PATCH /api/vehicles/:id` — تعديل بيانات المركبة أو تعيين سائق أو ترقية الـ GPS
- `DELETE /api/vehicles/:id` — حذف مركبة من الأسطول

#### د. التتبع الميداني ودورة بيانات GPS (Hybrid Telematics & Lifecycle)
- `POST /api/telematics/mobile/ping` — بث الإحداثيات كل 5 ثوانٍ من هاتف السائق
- `GET /api/telematics/live` — الخريطة المباشرة لمركبات الشركة
- `GET /api/telematics/trips/:taskId/summary` — ملخص الرحلة والمسافة والسرعات بعد التسليم
- `GET /api/telematics/trips/:taskId/playback` — جلب مسار الرحلة المضغوط لإعادة تشغيل الحركة
- `POST /api/telematics/ingest` — استقبال حزم أجهزة التتبع الصلبة (Hardware)
- `POST /api/telematics/vehicles/:id/commands` — إرسال أمر إيقاف المحرك عن بُعد

#### هـ. مهام نقل وشحن البضائع (Logistics Dispatch Tasks)
- `GET /api/tasks` — عرض قائمة شحنات الشركة
- `POST /api/tasks` — إنشاء مهمة توصيل بضائع وتحديد نقاط الاستلام والتسليم
- `PATCH /api/tasks/:id/assign` — تكليف سائق ومركبة بالشحنة
- `PATCH /api/tasks/:id/status` — تحديث حالة التوصيل
- `POST /api/tasks/:id/complete` — إثبات التسليم (POD) وضغط وتخزين مسار الرحلة
- `DELETE /api/tasks/:id` — إلغاء مهمة شحن

#### و. الصيانة وتقييم السائق (Linked Maintenance)
- `GET /api/maintenance` — سجلات الصيانة والأعطال
- `POST /api/maintenance` — الإبلاغ عن عطل (يغير حالة المركبة لـ `maintenance` ويسجل أثره على السائق)
- `PATCH /api/maintenance/:id/resolve` — إغلاق الصيانة وإعادة المركبة لحالة `active`

#### ز. السائقين وتقييم الأداء (Drivers CRUD)
- `GET /api/drivers` — قائمة السائقين مع درجات الأمان والمهام المنجزة
- `POST /api/drivers` — تسجيل سائق جديد
- `GET /api/drivers/:id` — ملف السائق
- `PATCH /api/drivers/:id` — تعديل بيانات السائق
- `DELETE /api/drivers/:id` — حذف السائق

#### ح. النطاقات والتنبيهات (Geofences & Alerts)
- `GET /api/geofences`, `POST /api/geofences`, `DELETE /api/geofences/:id`
- `GET /api/alerts`, `PATCH /api/alerts/:id/resolve`

#### ط. لوحة المؤشرات والذكاء الاصطناعي (Dashboard & AI)
- `GET /api/dashboard/stats` — إحصائيات التوصيل والمركبات اللحظية
- `GET /api/dashboard/ai-recommendations` — توصيات ذكية لدمج المسارات وتوفير استهلاك الوقود
