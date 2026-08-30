import Image from "next/image";
import { Logo } from "./Navbar";
import { footerNavLinks } from "./landing-config";

export function Footer() {
  return (
    <footer className="border-t border-[#94a3b8]/20 pt-[72px] pb-10">
      <div className="w-full max-w-[1360px] mx-auto px-[72px] max-[1180px]:px-10 max-[700px]:px-6 max-[430px]:px-[18px]">
        <div className="flex items-start justify-between gap-8 max-[700px]:flex-col max-[700px]:items-stretch">
          <nav className="flex flex-wrap gap-6" aria-label="روابط التذييل">
            {footerNavLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-muted hover:text-primary whitespace-nowrap text-[14px] font-medium transition-colors duration-180 focus-visible:outline-2 focus-visible:outline-blue-300 focus-visible:outline-offset-4 focus-visible:rounded"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="grid gap-3 justify-items-end max-[700px]:justify-items-start text-right">
            <Logo compact />
            <p className="text-muted text-[14px] m-0">إدارة أسطولك بذكاء، من مكان واحد.</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#10202F]/10 mt-10 pt-6 max-[700px]:flex-col max-[700px]:items-stretch max-[700px]:gap-4">
          <p className="text-muted text-[12px] m-0">© 2026 زمام. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4" aria-label="روابط التواصل">
            <a href="#" className="inline-flex items-center justify-center w-6 h-6 hover:opacity-80 transition-opacity" aria-label="Twitter">
              <Image src="/figma/landing/twitter.svg" alt="" width={18} height={18} />
            </a>
            <a href="#" className="inline-flex items-center justify-center w-6 h-6 hover:opacity-80 transition-opacity" aria-label="LinkedIn">
              <Image src="/figma/landing/linkedin.svg" alt="" width={18} height={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
