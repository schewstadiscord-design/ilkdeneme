import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Scissors,
  Phone,
  MapPin,
  Clock,
  Calendar as CalendarIcon,
  Star,
  Sparkles,
  Award,
  Quote,
  CheckCircle2,
  Instagram,
  AtSign,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookingModal } from "@/components/BookingModal";

import heroImg from "@/assets/hero-barbershop.jpg";
import aboutImage from "@/assets/about-barber.jpg";

function TikTok(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      // 1. ANA BAŞLIK (Google Arama Sonuçlarındaki Büyük Mavi Yazı)
      { title: "Saloon Deep | Gebze'nin En İyi Erkek Kuaförü ve Berberi" },

      // 2. VİTRİN AÇIKLAMASI (Başlığın altındaki 2 satırlık açıklama yazısı)
      {
        name: "description",
        content:
          "Gebze'de premium erkek kuaförü SaloonDeep. Saç tıraşı, sakal şekillendirme, ve modern erkek berberi hizmetleri. Hemen online randevu alın: 0543 879 24 13",
      },

      // 3. ÖLÜMCÜL ANAHTAR KELİMELER (Müşterilerin Google'a yazdığı kelimeler)
      {
        name: "keywords",
        content:
          "gebze berber, gebze kuaför, erkek berberi, gebze traş, gebze en iyi berber, saloon deep, kocaeli gebze erkek kuaförü, gebze saç kesimi, gebze sakal traşı",
      },

      // 4. WHATSAPP & INSTAGRAM ŞOVU (Link atıldığında çıkacak olan görsel kartvizit)
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Saloon Deep" },
      { property: "og:title", content: "Saloon Deep | Gebze Premium Erkek Kuaförü" },
      {
        property: "og:description",
          content: "Gebze'de modern, lüks berber deneyimi. Beklemeden tıraş olmak için online randevunuzu hemen oluşturun.",
      },
      { property: "og:image", content: heroImg },
      
      // 5. TWITTER (X) KARTI (Farklı platformlarda da şık durması için)
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Saloon Deep | Gebze Erkek Kuaförü" },
      { name: "twitter:description", content: "Gebze'de modern ve lüks bir berber deneyimi. Online randevu alın." },
      { name: "twitter:image", content: heroImg },

      // 6. GİZLİ SİLAH: YEREL SEO (Google'a "Biz Kocaeli/Gebze'deyiz" sinyali veren radar kodları)
      { name: "geo.region", content: "TR-41" },
      { name: "geo.placename", content: "Gebze" },
    ],
  }),
  component: Index,
});

const SERVICES = [
  {
    name: "Saç Tıraşı",
    desc: "Modern teknik ve klasik anlayışın buluştuğu özenli erkek saç tıraşı.",
    duration: "30 dk",
    price: "400₺",
    icon: Scissors,
  },
  {
    name: "Sakal Şekillendirme",
    desc: "Yüz hatlarınıza özel sakal tasarımı, sıcak havlu ve bakım.",
    duration: "25 dk",
    price: "200₺",
    icon: Sparkles,
  },
  {
    name: "Çocuk Tıraşı",
    desc: "Sabırlı, güler yüzlü ve özenli çocuk tıraşı deneyimi.",
    duration: "25 dk",
    price: "250₺",
    icon: Award,
  },
  {
    name: "Cilt & Bakım",
    desc: "Maske, sıcak havlu ve cilt bakımı ile tam yenilenme.",
    duration: "40 dk",
    price: "400₺",
    icon: Star,
  },
];

const REVIEWS = [
  {
    name: "Alperen Akbulak",
    text: "Yıllardır gelip gittiğim berberdir. Kafa yapısına göre saç kesimleri ve hizmetinden dolayı değişmeyeceğim bir yer.",
    when: "3 yıl önce",
  },
  {
    name: "Yusuf Oğur",
    text: "Mükemmel bir ilgi, çok güzel bir tıraş. Ellerine sağlık ustam. Tavsiye ediyorum.",
    when: "2 ay önce",
  },
  {
    name: "Enes Boztepe",
    text: "Gerçekten çok iyi kuaför. Bir kez denemeniz yeter.",
    when: "10 ay önce",
  },
];

function Index() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = () => setBookingOpen(true);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav onBook={openBooking} />
      <Hero onBook={openBooking} />
      <Services onBook={openBooking} />
      <About />
      <Reviews />
      <Visit onBook={openBooking} />
      <Footer />
      <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} />
    </div>
  );
}

function Nav({ onBook }: { onBook: () => void }) {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-2">
          <img src="/logo.png" alt="Saloon Deep Logo" className="h-6 w-6 object-contain" />
          <span className="font-display text-lg tracking-wide">
            Saloon <span className="text-gradient-gold">Deep</span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#services" className="transition hover:text-foreground">Hizmetler</a>
          <a href="#about" className="transition hover:text-foreground">Hakkımızda</a>
          <a href="#reviews" className="transition hover:text-foreground">Yorumlar</a>
          <a href="#visit" className="transition hover:text-foreground">İletişim</a>
        </nav>
        <Button onClick={onBook} variant="hero" size="sm">Randevu Al</Button>
      </div>
    </header>
  );
}

function Hero({ onBook }: { onBook: () => void }) {
  return (
    <section id="top" className="relative flex min-h-screen items-center overflow-hidden pt-16">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Saloon Deep iç mekan"
          width={1920}
          height={1280}
          className="h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Gebze · Premium Erkek Kuaförü
          </div>
          <h1 className="font-display text-5xl leading-[1.05] tracking-tight md:text-7xl">
            Stilinizi bir <br />
            <span className="text-gradient-gold">sanata</span> dönüştürüyoruz.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Deneyimli ustalardan, modern ekipmanlarla ve özenli ilgiyle.
            Saç tıraşı, sakal şekillendirme ve cilt bakımında Gebze'nin tercihi.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button onClick={onBook} variant="hero" size="lg">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Online Randevu Al
            </Button>
            <a href="tel:+905438792413">
              <Button variant="outlineGold" size="lg">
                <Phone className="mr-2 h-4 w-4" />
                0543 879 24 13
              </Button>
            </a>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-8 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <span className="text-muted-foreground">5,0 · Google Yorumları</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="text-muted-foreground">
              <span className="text-foreground font-medium">10+ yıl</span> tecrübe
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services({ onBook }: { onBook: () => void }) {
  return (
    <section id="services" className="relative py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Hizmetler"
          title="Her detayda ustalık"
          subtitle="Klasik berber geleneği ile modern stilin buluştuğu özenli hizmetler."
        />

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2">
          {SERVICES.map((s) => (
            <article
              key={s.name}
              className="group relative bg-card p-8 transition-colors hover:bg-card/60"
            >
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-2xl">{s.name}</h3>
                <span className="font-display text-xl text-gradient-gold">{s.price}</span>
              </div>
              <p className="mt-3 text-muted-foreground">{s.desc}</p>
              <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {s.duration}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button onClick={onBook} variant="hero" size="lg">Randevu oluştur</Button>
        </div>
      </div>
    </section>
  );
}

function About() {
  const points = [
    "Deneyimli ve özenli usta",
    "Steril ve modern ekipman",
    "Yeni nesil tıraşlarda uzmanlık",
    "Kişiye özel danışmanlık",
  ];
  return (
    <section id="about" className="relative border-y border-border/60 bg-gradient-to-b from-card/40 to-background py-28">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-2 md:items-center">
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" />
          <img
            src={aboutImage}
            alt="Saloon Deep ustası iş başında"
            width={1200}
            height={1400}
            loading="lazy"
            className="relative aspect-[5/6] w-full rounded-2xl object-cover shadow-card"
          />
        </div>
        <div>
          <SectionHeading eyebrow="Hakkımızda" title="Tarz, bir detaydan ibarettir." align="left" />
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Saloon Deep, Gebze'nin merkezinde yer alan, müşterileriyle samimi
            ilişkiler kuran premium bir erkek kuaförüdür. Her tıraş bir hikâye,
            her müşteri özeldir. Yetenek, sabır ve özen ile çalışıyoruz.
          </p>
          <ul className="mt-8 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          
          {/* Sosyal Medya Alanı */}
          <div className="mt-10 border-t border-border/60 pt-8">
            <p className="mb-5 text-sm font-medium tracking-wide text-muted-foreground uppercase">
              Bizi Sosyal Medyada Takip Edin
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/saloondeepp/"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
              >
                <Instagram className="h-4 w-4 transition-transform group-hover:scale-110" />
                Instagram
              </a>
              <a
                href="https://www.tiktok.com/@saloondeepp"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
              >
                <TikTok className="h-4 w-4 transition-transform group-hover:scale-110" />
                TikTok
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function Reviews() {
  return (
    <section id="reviews" className="py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Yorumlar"
          title="Müşterilerimiz ne diyor?"
          subtitle="Google üzerinden 5,0 puan ortalaması."
        />
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <article
              key={r.name}
              className="relative rounded-2xl border border-border bg-card p-8 shadow-card"
            >
              <Quote className="absolute -top-3 left-6 h-7 w-7 text-primary" />
              <div className="mb-4 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground">{r.text}</p>
              <div className="mt-6 border-t border-border/60 pt-4">
                <p className="font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.when}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Visit({ onBook }: { onBook: () => void }) {
  return (
    <section id="visit" className="relative border-t border-border/60 bg-card/30 py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Ziyaret" title="Bizi ziyaret edin" align="left" />
          <div className="mt-8 space-y-6 text-muted-foreground">
            <InfoRow icon={MapPin} title="Adres">
              Hüseyin Ağa İş Merkezi, Hacıhalil, İsmet Paşa Cd. No:9 Zemin,
              41400 Gebze/Kocaeli
            </InfoRow>
            
            <InfoRow icon={Phone} title="Telefon">
              <a href="tel:+905438792413" className="hover:text-primary">
                0543 879 24 13
              </a>
            </InfoRow>

            {/* --- EKLENEN SOSYAL MEDYA SATIRI --- */}
            <InfoRow icon={AtSign} title="Sosyal Medya">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
                <a
                  href="https://www.instagram.com/saloondeepp/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                  <span>Instagram</span>
                </a>
                <span className="text-border">|</span>
                <a
                  href="https://www.tiktok.com/@saloondeepp"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                >
                  <TikTok className="h-4 w-4" />
                  <span>TikTok</span>
                </a>
              </div>
            </InfoRow>

            <InfoRow icon={Clock} title="Çalışma saatleri">
              Pazartesi – Cumartesi · 10:00 – 20:30
              <br />
              Pazar · Kapalı
            </InfoRow>
          </div>
          
          <div className="mt-10 flex flex-wrap gap-3">
            <Button onClick={onBook} variant="hero">Randevu Al</Button>
            <a
              href="https://maps.app.goo.gl/3VKvmqtw2Pemg2wT9"
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outlineGold">Yol Tarifi</Button>
            </a>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-2xl border border-border shadow-card">
          <iframe
            title="Saloon Deep konum"
            src="https://www.google.com/maps?q=Hüseyin+Ağa+İş+Merkezi+İsmet+Paşa+Cd+No+9+Gebze&output=embed"
            className="h-full min-h-[380px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Saloon Deep Logo" className="h-5 w-5 object-contain" />
          <span className="font-display">
            Saloon <span className="text-gradient-gold">Deep</span>
          </span>
        </div>
        <p>© {new Date().getFullYear()} Saloon Deep · Gebze</p>
        <Link to="/admin" className="text-xs text-muted-foreground/60 hover:text-primary">Admin</Link>
      </div>
    </footer>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn(align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-xl")}>
      <p className="mb-4 text-xs uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
      <h2 className="font-display text-4xl leading-tight md:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <div className="mt-1 text-sm">{children}</div>
      </div>
    </div>
  );
}
