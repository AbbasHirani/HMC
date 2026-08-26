import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SetDocLang from '@/components/SetDocLang';
import { IconPhone, IconWA, IconCheck, IconShield, IconWrench, IconCalendar, IconTruck, IconDrop, IconFilter, IconSpray, IconGauge } from '@/components/Icons';
import { CONTACT, WA } from '@/lib/data';
import { sql } from '@/lib/db';
import RepairJobsCarousel from '@/components/RepairJobsCarousel';
import { jsonLd } from '@/lib/jsonLd';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'பம்ப் பழுது, ஃபில்டர் சர்வீஸ் & ஹைட்ரோ டெஸ்ட் பம்ப் பழுது — சென்னை',
  description: 'பம்ப் பழுது & மறுசீரமைப்பு, வாட்டர் ஃபில்டர் சர்வீஸ், கம்ப்ரசர் ஓவர்ஹால், ஹைட்ரோ டெஸ்ட் பம்ப் பழுது — சென்னை பாரிஸில். 17+ வருட அனுபவம்.',
  alternates: {
    canonical: '/ta/services',
    languages: { en: '/services', ta: '/ta/services', 'x-default': '/services' },
  },
  openGraph: {
    title: 'பம்ப் பழுது & சர்வீஸ் — சென்னை | Hirani Marketing Combines',
    description: 'பம்ப் பழுது & மறுசீரமைப்பு, வாட்டர் ஃபில்டர் சர்வீஸ், கம்ப்ரசர் ஓவர்ஹால், ஹைட்ரோ டெஸ்ட் பம்ப் பழுது — சென்னை பாரிஸில். 17+ வருட அனுபவம்.',
    url: '/ta/services',
    type: 'website',
    locale: 'ta_IN',
  },
};

const SVCS = [
  {
    Icon: IconDrop,
    name: 'பம்ப் பழுது & மறுசீரமைப்பு',
    desc: 'எல்லா வகை பம்புகளுக்கும் முழு பரிசோதனை, பழுது கண்டறிதல், மறுசீரமைப்பு — வீட்டு, சப்மெர்சிபிள், சென்ட்ரிஃபியூகல், கெமிக்கல் & தொழிற்சாலை பம்புகள்.',
    covers: [
      'பிரித்து, சுத்தம் செய்து, முழு பரிசோதனை',
      'பேரிங், ஷாஃப்ட், இம்பெல்லர் மாற்றுதல்',
      'மெக்கானிக்கல் சீல் மாற்றுதல்',
      'வைண்டிங் & மோட்டார் சோதனை',
      'பழுதுக்கு பின் பெர்ஃபார்மன்ஸ் & பிரஷர் டெஸ்ட்',
    ],
  },
  {
    Icon: IconFilter,
    name: 'வாட்டர் ஃபில்டர் பழுது & பராமரிப்பு',
    desc: 'RO, UV, சாஃப்ட்னர் மற்றும் தொழிற்சாலை வடிகட்டி சிஸ்டங்களுக்கு சர்வீஸ் & பாகங்கள் மாற்றுதல்.',
    covers: [
      'RO மெம்பிரேன், பம்ப், கார்ட்ரிட்ஜ் மாற்றுதல்',
      'UV லேம்ப் & குவார்ட்ஸ் ஸ்லீவ் மாற்றுதல்',
      'சாஃப்ட்னர் ரெசின் & உப்பு நிரப்புதல்',
      'பிரஷர் & ஃப்ளோ-ரேட் அளவீடு',
      'சர்வீஸுக்கு பின் தண்ணீர் தர சோதனை',
    ],
  },
  {
    Icon: IconSpray,
    name: 'ஏர் கம்ப்ரசர் பழுது',
    desc: 'பிஸ்டன், பெல்ட்-டிரைவ் & ஸ்க்ரூ வகை கம்ப்ரசர்களுக்கு ஓவர்ஹால் மற்றும் பராமரிப்பு.',
    covers: [
      'கம்ப்ரசர் ஹெட் & வால்வு ஓவர்ஹால்',
      'பிஸ்டன் ரிங் & கேஸ்கெட் மாற்றுதல்',
      'பெல்ட், ஃபில்டர், ஆயில் சர்வீஸ்',
      'சேஃப்டி வால்வு டெஸ்ட் & கேலிப்ரேஷன்',
      'எலெக்ட்ரிக்கல் & மோட்டார் சோதனை',
    ],
  },
  {
    Icon: IconGauge,
    name: 'ஹைட்ரோ பிரஷர் டெஸ்ட் பம்ப் பழுது',
    desc: 'பைப்லைன் டெஸ்டிங், ஃபயர் சிஸ்டம், வெசல் பிரஷர் டெஸ்டிங்கில் பயன்படும் ஹை-பிரஷர் பிளஞ்சர் பம்புகள் — மேனுவல் & மோட்டரைஸ்டு இரண்டும்.',
    covers: [
      'மேனுவல் ஹைட்ரோ டெஸ்ட் பம்ப் பழுது',
      'மோட்டரைஸ்டு பிளஞ்சர் பம்ப் சர்வீஸ்',
      'பிளஞ்சர், சீல், வால்வு மாற்றுதல்',
      'பிரஷர் கேஜ் கேலிப்ரேஷன்',
      'ஒவ்வொரு பழுதுக்கும் பின் முழு டெஸ்ட்',
    ],
  },
];

const WHY = [
  { Icon: IconCalendar, title: '17+ வருட அனுபவம்', body: '2008 முதல் தமிழ்நாடு முழுவதும் பம்புகள் & தண்ணீர் உபகரண விற்பனை மற்றும் சர்வீஸ்.' },
  { Icon: IconShield,   title: 'விலை சொன்ன பின்தான் வேலை', body: 'முதலில் பரிசோதித்து, பழுதை கண்டறிந்து, விலை சொல்கிறோம் — மறைமுக கட்டணம் இல்லை.' },
  { Icon: IconCheck,    title: 'ஒரிஜினல் பாகங்கள் மட்டும்', body: 'எல்லா மாற்று பாகங்களும் அங்கீகரிக்கப்பட்ட டீலர்களிடமிருந்து வாங்கப்பட்ட ஒரிஜினல் பாகங்கள்.' },
  { Icon: IconTruck,    title: 'விரைவான டெலிவரி', body: 'பெரும்பாலான பழுதுகள் அன்றே கண்டறியப்பட்டு விலை சொல்லப்படும்; சாதாரண வேலைகள் 48–72 மணி நேரத்தில் முடியும்.' },
];

const FAQS = [
  {
    q: 'சென்னையில் பம்ப் பழுது பார்க்க எவ்வளவு செலவாகும்?',
    a: 'பம்ப் வகை மற்றும் பழுதை பொறுத்து விலை மாறும். வேலை தொடங்கும் முன் பரிசோதித்து விலை சொல்கிறோம் — மறைமுக கட்டணம் கிடையாது. அன்றே பரிசோதனைக்கு கடைக்கு கொண்டு வாருங்கள் அல்லது அழைக்கவும்.',
  },
  {
    q: 'பம்ப் பழுது பார்க்க எத்தனை நாள் ஆகும்?',
    a: 'பெரும்பாலான பழுதுகள் அன்றே கண்டறியப்பட்டு விலை சொல்லப்படும். சாதாரண பழுது வேலைகள் 48–72 மணி நேரத்தில் முடிந்துவிடும்.',
  },
  {
    q: 'எல்லா வகை தண்ணீர் பம்புகளும் பழுது பார்ப்பீர்களா?',
    a: 'ஆம் — வீட்டு மோனோபிளாக், சப்மெர்சிபிள், சென்ட்ரிஃபியூகல், கெமிக்கல் மற்றும் தொழிற்சாலை பம்புகள். RO சிஸ்டம், வாட்டர் ஃபில்டர், ஏர் கம்ப்ரசர், ஹைட்ரோ டெஸ்ட் பம்புகளும் பழுது பார்க்கிறோம்.',
  },
  {
    q: 'விலை சொல்லாமல் வேலை தொடங்குவீர்களா?',
    a: 'இல்லை. முதலில் பரிசோதித்து, பழுதை கண்டறிந்து, முழு விலை சொல்கிறோம். நீங்கள் ஒப்புக்கொண்ட பின்தான் வேலை தொடங்கும்.',
  },
  {
    q: 'வீட்டுக்கு வந்து சர்வீஸ் செய்வீர்களா?',
    a: 'முக்கியமாக பாரிஸ் கடையில்தான் பழுது பார்க்கிறோம் — உபகரணத்தை கொண்டு வந்து கொடுங்கள். சில தொழிற்சாலை வேலைகளுக்கு ஆன்-சைட் சர்வீஸ் உண்டு. அழைத்து கேளுங்கள்.',
  },
  {
    q: 'என்ன பிராண்டுகள் விற்கிறீர்கள் & சர்வீஸ் செய்கிறீர்கள்?',
    a: 'Kent, CRI, Kirloskar, Grundfos, Crompton, Texmo, Shakti, Wilo, Pentair — இவற்றின் அங்கீகரிக்கப்பட்ட டீலர். ஒரிஜினல் பாகங்கள் இருப்பில் உள்ளன.',
  },
];

export default async function TamilServicesPage() {
  let repairJobs: { id: string; title: string; description: string | null; tag: string | null; imageUrl: string | null }[] = [];
  try {
    const rows = await sql`SELECT id, title, description, tag, image_url FROM repair_jobs ORDER BY sort_order, created_at DESC`;
    repairJobs = rows.map(r => ({
      id: r.id as string,
      title: r.title as string,
      description: (r.description as string | null) ?? null,
      tag: (r.tag as string | null) ?? null,
      imageUrl: (r.image_url as string | null) ?? null,
    }));
  } catch { /* table may not exist yet */ }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'ta',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <SetDocLang lang="ta" />
      <Header active="services" lang="ta" />
      <main>

      {/* HERO */}
      <section className="svc-hero">
        <div className="container">
          <div className="inner">
            <nav className="crumb">
              <Link href="/ta">முகப்பு</Link><span>/</span><b>சேவைகள் &amp; எங்களை பற்றி</b>
            </nav>
            <h1>பழுது, மறுசீரமைப்பு &amp; அதன் பின்னால் உள்ள மனிதர்கள்</h1>
            <p>
              நாங்கள் உபகரணங்களை விற்பது மட்டும் அல்ல — அவற்றை ஓடவைக்கிறோம். பம்புகள், வாட்டர் ஃபில்டர்கள், ஏர் கம்ப்ரசர்கள், ஹைட்ராலிக் சிஸ்டங்களுக்கு பழுது & பராமரிப்பு — 17+ வருட அனுபவத்துடன்.
            </p>
            <div className="pills">
              <span className="pill">பம்ப் பழுது &amp; மறுசீரமைப்பு</span>
              <span className="pill">ஃபில்டர் சர்வீஸ்</span>
              <span className="pill">கம்ப்ரசர் பழுது</span>
              <span className="pill">ஹைட்ராலிக் பராமரிப்பு</span>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="section" id="about" style={{ background: 'var(--paper)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <span className="eyebrow">நாங்கள் யார்</span>
              <h2 style={{ fontSize: 'clamp(28px,3.2vw,40px)', marginTop: 14 }}>
                2008 முதல் சென்னையின் நம்பகமான ஹார்டுவேர் &amp; தண்ணீர் சிஸ்டம் கடை
              </h2>
              <p style={{ color: 'var(--slate)', fontSize: 16, lineHeight: 1.7, marginTop: 16 }}>
                ஹிரானி மார்க்கெட்டிங் கம்பைன்ஸ் — தண்ணீர் பம்புகள், RO &amp; வடிகட்டி சிஸ்டங்கள், நீரூற்றுகள், பிரஷர் வாஷர்கள், தொழிற்சாலை உபகரணங்களை வீடுகள் மற்றும் தொழிற்சாலைகளுக்கு வழங்குகிறோம். நாங்கள் விற்கும் ஒவ்வொரு பொருளையும் நாங்களே சர்வீஸ் செய்கிறோம்.
              </p>
              <div className="at-list">
                {[
                  { Icon: IconCheck,  title: 'சரியான ஸ்பெசிஃபிகேஷன்',  sub: 'உங்கள் தேவைக்கு ஏற்ற கெபாசிட்டி, மெட்டீரியல் — யூகம் இல்லை.' },
                  { Icon: IconShield, title: 'ஒரிஜினல் பிராண்டுகள்',  sub: 'Kent, Aquaguard, CRI, Kirloskar, Grundfos, Crompton — அங்கீகரிக்கப்பட்ட விற்பனை.' },
                  { Icon: IconWrench, title: 'சொந்த பழுது டீம்',        sub: 'பரிசோதனை, மறுசீரமைப்பு, டெஸ்டிங் — எல்லாம் எங்கள் சொந்த டெக்னீஷியன்கள்.' },
                ].map((item, i) => (
                  <div className="at-item" key={i}>
                    <span className="at-ic"><item.Icon /></span>
                    <div><b>{item.title}</b><span>{item.sub}</span></div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
                <a className="btn btn-navy" href={CONTACT.phoneHref}>
                  <IconPhone />{CONTACT.phone}
                </a>
                <Link className="btn btn-ghost" href="/catalogue">பொருட்களை பாருங்கள்</Link>
              </div>
            </div>

            <div className="about-img" style={{ position: 'relative' }}>
              <Image src="/shop.jpg" alt="ஹிரானி மார்க்கெட்டிங் கம்பைன்ஸ் — பாரிஸ் கடை" width={0} height={0} sizes="100vw" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 16, boxShadow: '0 20px 60px rgba(20,20,63,.13)' }} />
              <div className="stat-card">
                <b>17<em>+</em></b>
                <span>வருட அனுபவம்</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section" id="services">
        <div className="container">
          <div className="sec-head">
            <span className="eyebrow">என்ன சர்வீஸ் செய்கிறோம்</span>
            <h2>பழுது &amp; மறுசீரமைப்பு சேவைகள்</h2>
            <p>உபகரணத்தை கொண்டு வாருங்கள் அல்லது அழைக்கவும் — பரிசோதித்து, சரி செய்து, டெஸ்ட் செய்து திருப்பி தருகிறோம்.</p>
          </div>
          <div style={{ marginTop: 48 }}>
            {SVCS.map((svc, i) => (
              <div className="svc-block" key={i}>
                <div className="svc-block-l">
                  <span className="sib-ic"><svc.Icon /></span>
                  <div>
                    <h3>{svc.name}</h3>
                    <p>{svc.desc}</p>
                  </div>
                </div>
                <div className="svc-block-r">
                  <h4>இதில் அடங்கும்</h4>
                  <div className="cover-list">
                    {svc.covers.map((c, j) => (
                      <div className="cover-item" key={j}>
                        <span className="ci"><IconCheck /></span>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                  <a
                    className="enquire"
                    href={WA + encodeURIComponent(svc.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconWA />இந்த சேவை பற்றி கேளுங்கள் <IconPhone />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="section" style={{ background: 'var(--paper)', borderTop: '1px solid var(--line)' }}>
        <div className="container">
          <div className="sec-head center">
            <span className="eyebrow">எப்படி நடக்கும்</span>
            <h2>அழைப்பிலிருந்து டெலிவரி வரை நான்கு படிகள்</h2>
          </div>
          <div className="steps" style={{ marginTop: 50 }}>
            {[
              { n: 1, done: true,  title: 'தொடர்பு கொள்ளுங்கள்',      body: 'அழையுங்கள் அல்லது WhatsApp செய்யுங்கள் — பிரச்சனை, உபகரண வகை, இடம் சொல்லுங்கள்.' },
              { n: 2, done: true,  title: 'பரிசோதனை & விலை',          body: 'எங்கள் டெக்னீஷியன் பரிசோதித்து, பழுதை கண்டறிந்து, விலை சொல்வார். ஒப்புதலுக்கு பின்தான் வேலை.' },
              { n: 3, done: true,  title: 'பழுது & மறுசீரமைப்பு',      body: 'ஒரிஜினல் பாகங்களுடன் எங்கள் ஒர்க்ஷாப்பில் சரி செய்யப்படும்.' },
              { n: 4, done: false, title: 'டெஸ்ட் & டெலிவரி',          body: 'பிரஷர், ஃப்ளோ, எலெக்ட்ரிக்கல் சோதனைகளுக்கு பின் உபயோகிக்க தயாராக திருப்பி தரப்படும்.' },
            ].map(step => (
              <div className={`step${step.done ? ' done' : ''}`} key={step.n}>
                <div className="step-num">{step.n}</div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REPAIR WORK SHOWCASE */}
      {repairJobs.length > 0 && (
        <section className="section" style={{ background: 'var(--paper)', borderTop: '1px solid var(--line)' }}>
          <div className="container">
            <div className="sec-head center">
              <span className="eyebrow">எங்கள் வேலை</span>
              <h2>சமீபத்திய பழுது &amp; மறுசீரமைப்பு வேலைகள்</h2>
            </div>
            <div style={{ marginTop: 44, padding: '0 28px' }}>
              <RepairJobsCarousel jobs={repairJobs} />
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="section" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="container">
          <div className="sec-head center">
            <span className="eyebrow">அடிக்கடி கேட்கப்படும்</span>
            <h2>கேள்வி பதில்கள்</h2>
          </div>
          <div style={{ maxWidth: 760, margin: '44px auto 0', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {FAQS.map(({ q, a }, i) => (
              <details key={i} style={{ borderBottom: '1px solid var(--line)', padding: '20px 0' }}>
                <summary style={{
                  fontSize: 16, fontWeight: 700, color: 'var(--navy)',
                  cursor: 'pointer', listStyle: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
                }}>
                  {q}
                  <span style={{ fontSize: 22, fontWeight: 300, color: 'var(--muted)', flexShrink: 0 }}>+</span>
                </summary>
                <p style={{ fontSize: 15.5, color: 'var(--slate)', lineHeight: 1.75, marginTop: 12, marginBottom: 0 }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* WHY HIRANI */}
      <section className="section">
        <div className="container">
          <div className="sec-head center">
            <span className="eyebrow">ஏன் ஹிரானி</span>
            <h2>வாடிக்கையாளர்கள் திரும்ப வருவதற்கான நான்கு காரணங்கள்</h2>
          </div>
          <div className="why-grid" style={{ marginTop: 44 }}>
            {WHY.map((w, i) => (
              <div className="why-card" key={i}>
                <span className="wc-ic"><w.Icon /></span>
                <h3>{w.title}</h3>
                <p>{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30, flexWrap: 'wrap' }}>
              <div>
                <h2>உபகரணம் பழுதா? எங்களை அழையுங்கள்.</h2>
                <p>அன்றே பதில் தருகிறோம் — பரிசோதனை, பழுது கண்டறிதல், விலை — எல்லாம் வேலை தொடங்கும் முன்.</p>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a className="btn btn-primary btn-lg" href={CONTACT.phoneHref}><IconPhone />இப்போது அழைக்கவும்</a>
                <a className="btn btn-ghost-light btn-lg" href={WA} target="_blank" rel="noopener noreferrer"><IconWA />WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      </main>
      <Footer lang="ta" />
    </>
  );
}
