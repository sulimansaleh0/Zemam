# Zemam SaaS REST API v1.2 (B2B Multi-Tenant Logistics Platform)
## توثيق واجهة برمجة التطبيقات لمنظومة زمام السحابية

---

### 🏛️ 1. المعمارية المعتمدة لمنظومة زمام (SaaS Architecture)
1. **مدير الشركة (`ADMIN`):**
   - إنشاء الفرق التشغيلية وإدارتها وتعيين مدراء الأساطيل والسائقين والمركبات عليها.
   - إدارة المستودع العام للشركة (المركبات والسائقين والمدراء غير المعينين على فرق).
   - عرض التقارير والإحصائيات المالية والتشغيلية الشاملة للشركة.
2. **مدير الأسطول (`FLEET_MANAGER`):**
   - إدارة سائقي ومركبات فريقه التشغيلي فقط (`Scoped to Team`).
   - إنشاء المهام اللوجستية وتكليف السائقين بها.
   - اعتماد فواتير الوقود وبلاغات الصيانة الخاصة بفريقه.
3. **السائق الميداني (`DRIVER`):**
   - استعراض المهام المسندة إليه، قبولها، وإتمامها.
   - تسجيل فواتير تعبئة الوقود ورفع صور العداد والإيصال.
   - الإبلاغ عن الأعطال الدورية والطارئة مع صور التوثيق.
4. **قاعدة ربط السائق بالمركبة الصارمة (Strict Same-Team Linking):**
   - لا يمكن إسناد مركبة لسائق إلا إذا كان كلاهما منضماً لنفس الفريق التشغيلي (`driver.teamId === vehicle.teamId`).
   - يمنع تعيين سائق أو مركبة متواجدين في المستودع العام (بدون فريق).

---

### 📋 2. جدول نقاط النهاية المعتمد (Full Live Endpoints Reference)

#### أ. المصادقة والجلسات (Auth & Multi-Tenant Session)
- `POST /api/auth/signup` — تسجيل حساب شركة جديد (Admin)
- `POST /api/auth/login` — تسجيل الدخول وضبط HttpOnly Cookie
- `POST /api/auth/google` — تسجيل الدخول عبر Google OAuth2
- `POST /api/auth/onboarding` — تحديد اسم الشركة الرسمي بعد التسجيل
- `POST /api/auth/verify-email` — إرسال رمز OTP لاستعادة كلمة المرور
- `POST /api/auth/verify-otp` — التحقق من رمز OTP
- `POST /api/auth/reset-password` — تعيين كلمة مرور جديدة
- `POST /api/auth/refresh-token` — تجديد Access Token
- `POST /api/auth/logout` — تسجيل الخروج ومسح الجلسة

#### ب. الملف الشخصي وحالة المستخدمين (User & Profile)
- `GET /api/user/me` — استرجاع الجلسة الحالية والدور والشركة والفريق
- `PATCH /api/user` — تحديث بيانات الحساب والملف الشخصي
- `PATCH /api/user/:id/status` — تغيير حالة المستخدم (`active` / `inactive`)

#### ج. إدارة مدراء الأساطيل (Fleet Managers - Admin Only)
- `GET /api/user/fleet-manager` — قائمة مدراء الأساطيل (يدعم `withoutTeam=true`)
- `POST /api/user/fleet-manager` — إنشاء حساب مدير أسطول جديد
- `POST /api/user/fleet-manager/:id/team` — تعيين مدير أسطول على فريق (`{ teamId }`)
- `POST /api/user/fleet-manager/:id/remove-from-team` — فك ارتباط مدير عن فريقه
- `DELETE /api/user/fleet-manager/:id` — حذف مدير أسطول (Soft Delete)

#### د. إدارة السائقين (Drivers Management)
- `GET /api/user/driver` — قائمة السائقين (يدعم `withoutTeam=true`)
- `POST /api/user/driver` — إضافة سائق جديد للأسطول
- `POST /api/user/driver/:id/assign-to-vehicle` — ربط السائق بمركبة من نفس الفريق (`{ vehicleId }`)
- `POST /api/user/driver/:id/remove-from-vehicle` — فك ارتباط السائق عن مركبته
- `POST /api/user/driver/:id/assign-to-team` — تعيين سائق على فريق (`{ teamId }`)
- `POST /api/user/driver/:id/remove-from-team` — فك ارتباط سائق عن فريقه
- `DELETE /api/user/driver/:id` — حذف سائق من المنظومة (Soft Delete)

#### هـ. الفرق التشغيلية (Operational Teams)
- `GET /api/team` — قائمة الفرق التشغيلية للشركة (Admin)
- `GET /api/team/:id` — تفاصيل فريق تشغيلي محدد
- `POST /api/team` — إنشاء فريق وتعيين المدير والسائقين والمركبات
- `PATCH /api/team/:id` — تعديل اسم الفريق
- `DELETE /api/team/:id` — حذف فريق تشغيلي (Admin)
- `GET /api/team/statics` — الإحصائيات التشغيلية الخاصة بالفريق

#### و. أسطول المركبات (Vehicles Fleet)
- `GET /api/vehicle` — قائمة المركبات (يدعم `withoutTeam=true`)
- `GET /api/vehicle/:id` — تفاصيل مركبة محددة
- `POST /api/vehicle` — إضافة مركبة جديدة للأسطول
- `PATCH /api/vehicle/:id/status` — تغيير حالة المركبة (`active` / `inactive`)
- `POST /api/vehicle/:id/assign-to-team` — إسناد مركبة لفريق تشغيلي (`{ teamId }`)
- `POST /api/vehicle/:id/remove-from-team` — نقل مركبة للمستودع العام
- `DELETE /api/vehicle/:id` — حذف مركبة من الأسطول (Soft Delete)

#### ز. المهام اللوجستية والتوزيع (Tasks Dispatch)
- `POST /api/task` — إنشاء وتكليف مهمة (`{ description, driverId, vehicleId }`)
- `GET /api/task` — عرض مهام الفريق / الشركة
- `GET /api/task/:id` — تفاصيل مهمة محددة
- `PATCH /api/task/:id` — تعديل مهمة معلقة
- `PATCH /api/task/:id/decline` — رفض / إلغاء مهمة
- `GET /api/task/driver` — مهام السائق المعلقة (Driver Only)
- `PATCH /api/task/:id/accept` — قبول المهمة وبدء التنفيذ (Driver Only)
- `PATCH /api/task/:id/finish` — إنهاء وإتمام المهمة (Driver Only)

#### ح. الوقود والصيانة (Operations)
- `POST /api/fuel` — تسجيل فاتورة وقود (سائق، Multipart مع صورة الإيصال)
- `GET /api/fuel` — استعراض فواتير الوقود (مدير الأسطول)
- `POST /api/fuel/:id` — اعتماد فاتورة الوقود (مدير الأسطول)
- `POST /api/maintenance` — تسجيل بلاغ صيانة مع صور الأعطال
- `GET /api/maintenance` — استعراض سجلات الصيانة (مدير الأسطول)
- `POST /api/maintenance/:id` — اعتماد وإغلاق بلاغ الصيانة

#### ط. إحصائيات الشركة الشاملة (Company Analytics)
- `GET /api/company/statics` — لوحة المؤشرات الإحصائية العامة للشركة (Admin Only)
