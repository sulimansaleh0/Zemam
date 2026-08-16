import { Activity, ArrowLeft, LockKeyhole, ShieldCheck, Truck } from 'lucide-react';
import type { ReactNode } from 'react';

interface AuthShellProps {
  children: ReactNode;
}

/* ─── Logo ─────────────────────────────────────────────── */

function ZamamLogo() {
  return (
    <div className="zamam-logo" dir="rtl">
      <div className="zamam-logo__icon">
        <Activity size={20} color="white" strokeWidth={2.5} />
      </div>
      <div className="zamam-logo__text">
        <div className="zamam-logo__name">زمام</div>
        <div className="zamam-logo__sub">ZAMAM FLEET</div>
      </div>
    </div>
  );
}

/* ─── Operational Visual (Fleet Stats Panel) ───────────── */

function OperationalVisual() {
  return (
    <div className="zamam-visual">
      <div className="zamam-visual__blob-1" />
      <div className="zamam-visual__blob-2" />

      <div className="zamam-visual__header">
        <span>مركز العمليات</span>
        <span className="zamam-visual__status">
          <span className="zamam-visual__status-dot" />
          النظام يعمل
        </span>
      </div>

      <div className="zamam-visual__cards">
        <div className="zamam-visual__card zamam-visual__card--fleet">
          <Truck size={20} className="zamam-visual__card-icon" />
          <div className="zamam-visual__card-number">58</div>
          <div className="zamam-visual__card-label">مركبة في الخدمة</div>
        </div>
        <div className="zamam-visual__card zamam-visual__card--safety">
          <ShieldCheck size={20} className="zamam-visual__card-icon" />
          <div className="zamam-visual__card-number">99.2%</div>
          <div className="zamam-visual__card-label">سلامة التشغيل هذا الشهر</div>
          <div className="zamam-visual__progress">
            <div className="zamam-visual__progress-fill" />
          </div>
        </div>
      </div>

      <div className="zamam-visual__live">
        <div className="zamam-visual__live-icon">
          <Activity size={16} />
        </div>
        <div>
          <div className="zamam-visual__live-title">تحديث مباشر للأسطول</div>
          <div className="zamam-visual__live-subtitle">آخر مزامنة منذ دقيقة واحدة</div>
        </div>
        <ArrowLeft size={16} className="zamam-visual__live-arrow" />
      </div>
    </div>
  );
}

/* ─── Auth Shell ───────────────────────────────────────── */

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="zamam-auth">
      <div className="zamam-grid">
        {/* ── Form Side ── */}
        <section className="zamam-form-section">
          <div className="zamam-rise">
            <ZamamLogo />
          </div>
          <div className="zamam-form-section__content">
            <div className="zamam-form-section__inner">{children}</div>
          </div>
          <div className="zamam-form-section__footer">
            © ٢٠٢٤ زمام · جميع الحقوق محفوظة
          </div>
        </section>

        {/* ── Aside — Fleet Operations Panel ── */}
        <aside className="zamam-aside">
          <div className="zamam-aside__glow" />
          <div className="zamam-aside__tag">
            <span className="zamam-aside__tag-line" />
            <span className="zamam-aside__tag-text">منصة تشغيل الأسطول</span>
          </div>
          <div className="zamam-aside__hero">
            <div className="zamam-rise zamam-aside__hero-eyebrow">
              رؤية أوضح. قرارات أسرع.
            </div>
            <h1 className="zamam-rise zamam-delay-1 zamam-aside__hero-title">
              أسطولك تحت<br />
              <span>سيطرتك الكاملة.</span>
            </h1>
            <p className="zamam-rise zamam-delay-2 zamam-aside__hero-desc">
              زمام يجمع المركبات، السائقين، والعمليات اليومية في مساحة واحدة
              تمنح فريقك صورة دقيقة في كل لحظة.
            </p>
          </div>
          <OperationalVisual />
          <div className="zamam-aside__security">
            <LockKeyhole size={16} className="zamam-aside__security-icon" />
            بيانات عملياتك محمية ومشفرة دائماً
          </div>
        </aside>
      </div>
    </main>
  );
}
