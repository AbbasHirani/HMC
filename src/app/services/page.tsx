import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { IconPhone, IconWA, IconCheck, IconShield, IconWrench, IconCalendar, IconTruck, IconDrop, IconFilter, IconSpray, IconGauge } from '@/components/Icons';
import { CONTACT, WA } from '@/lib/data';
import { sql } from '@/lib/db';
import RepairJobsCarousel from '@/components/RepairJobsCarousel';
import { jsonLd } from '@/lib/jsonLd';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pump Repair, Filter Servicing & Hydro Test Pump Repair in Chennai',
  description: 'Pump repair & reconditioning, water filter servicing, compressor overhaul and hydro pressure test pump repair in Chennai. 17+ years in the trade. Drop in at our Parrys workshop.',
  alternates: {
    canonical: '/services',
    languages: { en: '/services', ta: '/ta/services', 'x-default': '/services' },
  },
  openGraph: {
    title: 'Pump Repair & Servicing in Chennai | Hirani Marketing Combines',
    description: 'Pump repair & reconditioning, water filter servicing, air compressor overhaul and hydro pressure test pump repair in Chennai. 17+ years in the trade. Drop in at our Parrys workshop.',
    url: '/services',
    type: 'website',
  },
};

const SVCS = [
  {
    Icon: IconDrop,
    name: 'Pump Repair & Reconditioning',
    desc: 'Full inspection, diagnosis, and reconditioning for all types of pumps — domestic, submersible, centrifugal, chemical and industrial.',
    covers: [
      'Disassembly, cleaning and full inspection',
      'Bearing, shaft and impeller replacement',
      'Mechanical seal replacement',
      'Winding and motor checks',
      'Performance and pressure testing after repair',
      'Available for domestic, industrial and chemical pumps',
    ],
  },
  {
    Icon: IconFilter,
    name: 'Water Filter Repair & Maintenance',
    desc: 'Servicing and component replacement for RO, UV, softener and industrial filtration systems — in the field or at our workshop.',
    covers: [
      'RO membrane, pump and cartridge replacement',
      'UV lamp and quartz sleeve replacement',
      'Softener resin refresh and salt top-up',
      'System pressure and flow-rate measurement',
      'Water quality check after service',
      'Domestic, commercial and industrial systems',
    ],
  },
  {
    Icon: IconSpray,
    name: 'Air Compressor Repair',
    desc: 'Overhaul and maintenance service for air compressors across Chennai — piston, belt-drive and screw types.',
    covers: [
      'Compressor head and valve overhaul',
      'Piston ring and gasket replacement',
      'Belt, filter and oil service',
      'Safety valve testing and pressure calibration',
      'Electrical and motor checks',
      'Workshop or on-site service available',
    ],
  },
  {
    Icon: IconGauge,
    name: 'Hydro Pressure Test Pump Repair & Servicing',
    desc: 'Repair and servicing of manual and motorised hydro pressure test pumps — high-pressure plunger pumps used for pipeline testing, fire system commissioning, vessel pressure testing and industrial leak detection.',
    covers: [
      'Manual hydro test pump repair & reconditioning',
      'Motorised high-pressure plunger pump servicing',
      'Pipeline pressure testing pump overhaul',
      'Fire system hydro test pump repair',
      'Plunger, seal and valve replacement',
      'Pressure gauge calibration & fitting',
      'Hose and fitting inspection & replacement',
      'Full performance test after every repair',
    ],
  },
];

const WHY = [
  { Icon: IconCalendar, title: '17+ years in the trade', body: 'Supplying and servicing pumps and water equipment across Tamil Nadu since 2008.' },
  { Icon: IconShield,   title: 'No work without a quote', body: 'We inspect, diagnose and quote before touching your equipment — no hidden costs.' },
  { Icon: IconCheck,    title: 'Genuine parts only', body: 'All replacement components are genuine and sourced from authorised distributors.' },
  { Icon: IconTruck,    title: 'Fast turnaround', body: 'Most repairs are diagnosed and quoted same-day; standard jobs completed within 48–72 hours.' },
];

export default async function ServicesPage() {
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
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How much does pump repair cost in Chennai?',
        acceptedAnswer: { '@type': 'Answer', text: 'Pump repair costs at Hirani Marketing Combines vary by pump type and the nature of the fault. We inspect and quote before starting any work — no hidden charges. Call +91 98401 59762 or drop in at our Parrys workshop for a same-day inspection and quote.' },
      },
      {
        '@type': 'Question',
        name: 'How long does pump repair take?',
        acceptedAnswer: { '@type': 'Answer', text: 'Most repairs are diagnosed and quoted same-day. Standard pump repair and reconditioning jobs are completed within 48–72 hours. Turnaround depends on parts availability and the extent of the repair needed.' },
      },
      {
        '@type': 'Question',
        name: 'Do you repair all types of water pumps?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes — Hirani Marketing Combines repairs domestic monoblock pumps, submersible pumps, centrifugal pumps, chemical pumps and industrial pumps. We also repair RO water filters, air compressors and hydro pressure test pumps.' },
      },
      {
        '@type': 'Question',
        name: 'Do you offer on-site pump repair or only workshop service?',
        acceptedAnswer: { '@type': 'Answer', text: 'We primarily offer workshop repair at our Parrys, Chennai location — drop in your equipment and we handle the rest. On-site service is available for select cases. Call +91 98401 59762 to discuss your requirements.' },
      },
      {
        '@type': 'Question',
        name: 'Do you start repair work before quoting a price?',
        acceptedAnswer: { '@type': 'Answer', text: 'No. Hirani Marketing Combines inspects and diagnoses your equipment first, then provides a full repair quote before any work begins. You only pay if you approve the quote.' },
      },
      {
        '@type': 'Question',
        name: 'Do you repair RO water purifiers and water filters?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes — we service and repair RO systems, UV purifiers and water softeners. Services include RO membrane replacement, pump and cartridge replacement, UV lamp and quartz sleeve replacement, softener resin refresh, and water quality checks after service.' },
      },
      {
        '@type': 'Question',
        name: 'What brands of water pumps do you sell and service in Chennai?',
        acceptedAnswer: { '@type': 'Answer', text: 'Hirani Marketing Combines is an authorised dealer for Kent, CRI, Kirloskar, Grundfos, Crompton, Texmo, Shakti, Wilo and Pentair. We stock genuine replacement parts and service all these brands at our Parrys workshop.' },
      },
      {
        '@type': 'Question',
        name: 'Where is Hirani Marketing Combines located?',
        acceptedAnswer: { '@type': 'Answer', text: 'Hirani Marketing Combines is located at Old No.133 / New No.279, Thambu Chetty St, opposite TNEB office, Parrys, George Town, Chennai – 600001. We are open Monday to Saturday, 9 am to 6 pm.' },
      },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to get your equipment repaired at Hirani Marketing Combines, Chennai',
    description: 'Four steps from contacting us to collecting your repaired equipment.',
    totalTime: 'P3D',
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Contact us', text: 'Call +91 98401 59762 or WhatsApp — describe the problem, equipment type and location. You can also drop in at our Parrys workshop.' },
      { '@type': 'HowToStep', position: 2, name: 'Inspection & diagnosis', text: 'Our technician inspects the equipment, identifies the fault and provides a full repair quote. No work begins until you approve the quote.' },
      { '@type': 'HowToStep', position: 3, name: 'Repair & reconditioning', text: 'Parts are replaced, cleaned and reconditioned using genuine branded components in our workshop.' },
      { '@type': 'HowToStep', position: 4, name: 'Test & return', text: 'Full performance test before handover — pressure, flow and electrical checks as applicable. Equipment returned ready to use.' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(howToSchema) }} />
      <Header active="services" />

      {/* HERO */}
      <section className="svc-hero">
        <div className="container">
          <div className="inner">
            <nav className="crumb">
              <Link href="/">Home</Link><span>/</span><b>Services &amp; About</b>
            </nav>
            <h1>Repair, reconditioning &amp; the people behind it</h1>
            <p>
              We don&rsquo;t just supply equipment — we keep it running. Workshop repair and maintenance for pumps, water filters, air compressors and hydraulic systems, backed by 17+ years in the trade.
            </p>
            <div className="pills">
              <span className="pill">Pump repair &amp; reconditioning</span>
              <span className="pill">Filter servicing</span>
              <span className="pill">Compressor repair</span>
              <span className="pill">Hydraulic maintenance</span>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="section" id="about" style={{ background: 'var(--paper)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <span className="eyebrow">Who we are</span>
              <h2 style={{ fontSize: 'clamp(28px,3.2vw,40px)', marginTop: 14 }}>
                Chennai&rsquo;s trusted hardware &amp; water-systems supplier since 2008
              </h2>
              <p style={{ color: 'var(--slate)', fontSize: 16, lineHeight: 1.7, marginTop: 16 }}>
                Hirani Marketing Combines supplies and services water pumps, RO &amp; filtration systems, fountains, pressure washers and industrial equipment to homes, businesses and plants across Tamil Nadu. Every product we supply, we can also service — matched to the correct specification, genuinely branded, and backed by our own repair and reconditioning team.
              </p>
              <div className="at-list">
                {[
                  { Icon: IconCheck,  title: 'Supplied to specification',  sub: 'We match every enquiry to the correct capacity, material and application — no guesswork.' },
                  { Icon: IconShield, title: 'Genuine brands, every time',  sub: 'Kent, Aquaguard, CRI, Kirloskar, Grundfos, Crompton and more — authorised supply only.' },
                  { Icon: IconWrench, title: 'In-house repair team',        sub: 'Our own technicians handle inspection, reconditioning and testing — no outsourcing.' },
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
                <Link className="btn btn-ghost" href="/catalogue">Browse products</Link>
              </div>
            </div>

            <div className="about-img" style={{ position: 'relative' }}>
              <Image src="/shop.jpg" alt="Hirani Marketing Combines — Parrys storefront" width={0} height={0} sizes="100vw" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 16, boxShadow: '0 20px 60px rgba(20,20,63,.13)' }} />
              <div className="stat-card">
                <b>17<em>+</em></b>
                <span>Years in the trade</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section" id="services">
        <div className="container">
          <div className="sec-head">
            <span className="eyebrow">What we service</span>
            <h2>Repair &amp; reconditioning services</h2>
            <p>Bring in your equipment or call us — we inspect, diagnose, recondition and test before return.</p>
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
                  <h4>What we cover</h4>
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
                    <IconWA />Enquire about this service <IconPhone />
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
            <span className="eyebrow">How it works</span>
            <h2>Four steps from call to collection</h2>
          </div>
          <div className="steps" style={{ marginTop: 50 }}>
            {[
              { n: 1, done: true,  title: 'Contact us',               body: 'Call or WhatsApp — describe the problem, equipment type and location.' },
              { n: 2, done: true,  title: 'Inspection & diagnosis',    body: 'Our technician inspects, identifies the fault and quotes the repair cost before any work begins.' },
              { n: 3, done: true,  title: 'Repair & reconditioning',   body: 'Parts replaced, cleaned and reconditioned using genuine components in our workshop.' },
              { n: 4, done: false, title: 'Test & return',             body: 'Full performance test before handover — pressure, flow and electrical checks as applicable.' },
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
              <span className="eyebrow">Our work</span>
              <h2>Recent repair &amp; reconditioning jobs</h2>
              <p style={{ color: 'var(--slate)', maxWidth: 520, margin: '10px auto 0' }}>
                A look at equipment we&rsquo;ve repaired, reconditioned and returned to service for our customers.
              </p>
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
            <span className="eyebrow">Common questions</span>
            <h2>Frequently asked questions</h2>
          </div>
          <div style={{ maxWidth: 760, margin: '44px auto 0', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              {
                q: 'How much does pump repair cost in Chennai?',
                a: 'Costs vary by pump type and fault. We inspect and quote before starting any work — no hidden charges, no surprise bills. Drop in your equipment or call us for a same-day assessment.',
              },
              {
                q: 'How long does pump repair take?',
                a: 'Most jobs are diagnosed and quoted same-day. Standard pump repair and reconditioning is completed within 48–72 hours. Turnaround depends on parts availability and repair scope.',
              },
              {
                q: 'Do you repair all types of water pumps?',
                a: 'Yes — domestic monoblock, submersible, centrifugal, chemical and industrial pumps. We also repair RO systems, water filters, air compressors and hydro pressure test pumps.',
              },
              {
                q: 'Do you start work before quoting?',
                a: 'Never. We inspect, diagnose and provide a full written quote first. Work only begins after you approve it — no commitment to inspect.',
              },
              {
                q: 'Do you offer on-site repair or only workshop?',
                a: 'Primarily workshop-based at our Parrys shop — drop in your equipment and collect it repaired. On-site service is available for select industrial cases. Call to discuss.',
              },
              {
                q: 'What brands do you carry and service?',
                a: 'We are authorised dealers for Kent, CRI, Kirloskar, Grundfos, Crompton, Texmo, Shakti, Wilo and Pentair. We stock genuine parts and service all these brands.',
              },
            ].map(({ q, a }, i) => (
              <details
                key={i}
                style={{
                  borderBottom: '1px solid var(--line)',
                  padding: '20px 0',
                }}
              >
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
            <span className="eyebrow">Why Hirani</span>
            <h2>Four reasons buyers come back</h2>
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
                <h2>Equipment needs attention? Call us.</h2>
                <p>We respond the same day — inspection, diagnosis and quote before any work begins.</p>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a className="btn btn-primary btn-lg" href={CONTACT.phoneHref}><IconPhone />Call now</a>
                <a className="btn btn-ghost-light btn-lg" href={WA} target="_blank" rel="noopener noreferrer"><IconWA />WhatsApp us</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
