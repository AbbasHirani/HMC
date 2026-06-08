import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import path from 'path';
import fs from 'fs';
import type { Product } from './data';
import { CONTACT } from './data';

const LOGO_MARK     = 'data:image/png;base64,' + fs.readFileSync(path.join(process.cwd(), 'public', 'logo-mark.png')).toString('base64');
const LOGO_WORDMARK = 'data:image/png;base64,' + fs.readFileSync(path.join(process.cwd(), 'public', 'logo-wordmark.png')).toString('base64');

const INK   = '#0f172a';
const BODY  = '#334155';
const MUTED = '#94a3b8';
const RULE  = '#e2e8f0';
const ORANGE = '#ea580c';
const BG    = '#f8fafc';

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', backgroundColor: '#fff', paddingBottom: 52 },

  /* ── HEADER ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: ORANGE,
  },

  // Logo side
  logoSide: { flexDirection: 'column' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  logoMark:     { width: 40, height: 40 },
  logoWordmark: { width: 142, height: 25, objectFit: 'contain' },
  tagline: { fontSize: 7.5, color: MUTED, marginTop: 7, letterSpacing: 0.2 },

  // Contact side — vertical rows with a divider
  contactSide: {
    flexDirection: 'column',
    gap: 4.5,
    paddingLeft: 26,
    borderLeftWidth: 1,
    borderLeftColor: RULE,
  },
  contactRow:  { flexDirection: 'row', alignItems: 'flex-start' },
  cLabel: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: ORANGE,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    width: 46,
    marginTop: 0.5,
  },
  cValue: { fontSize: 8.5, color: BODY, fontFamily: 'Helvetica-Bold', maxWidth: 200, lineHeight: 1.35 },

  /* ── BODY ── */
  body: { paddingHorizontal: 40, paddingTop: 26 },

  productName: { fontSize: 26, fontFamily: 'Helvetica-Bold', color: INK, lineHeight: 1.12, letterSpacing: -0.3 },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 9, flexWrap: 'wrap' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 5, marginRight: 14 },
  metaLabel: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: MUTED, letterSpacing: 1.1, textTransform: 'uppercase' },
  metaValue: { fontSize: 9, color: BODY, fontFamily: 'Helvetica-Bold' },
  metaPipe:  { width: 1, height: 10, backgroundColor: RULE, marginRight: 14 },

  priceRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 20,
    marginTop: 18, paddingBottom: 18,
    borderBottomWidth: 1, borderBottomColor: RULE,
  },
  priceLabel: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: ORANGE, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 3 },
  priceValue: { fontSize: 30, fontFamily: 'Helvetica-Bold', color: INK, letterSpacing: -0.8 },
  priceNote:  { fontSize: 8.5, color: MUTED, lineHeight: 1.65, maxWidth: 240, paddingBottom: 3 },

  cols:     { flexDirection: 'row', gap: 26, marginTop: 20 },
  colLeft:  { flex: 1.1 },
  colRight: { flex: 1 },

  mainImg: { width: '100%', height: 210, objectFit: 'contain', backgroundColor: BG, borderWidth: 1, borderColor: RULE, borderRadius: 4 },
  thumbRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  thumbImg: { flex: 1, height: 78, objectFit: 'contain', backgroundColor: BG, borderWidth: 1, borderColor: RULE, borderRadius: 3 },
  noImg:    { width: '100%', height: 210, backgroundColor: BG, borderWidth: 1, borderColor: RULE, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  noImgTxt: { fontSize: 9, color: MUTED },

  secHead: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: MUTED, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 10 },
  descText: { fontSize: 9.5, color: BODY, lineHeight: 1.72 },
  infoRule: { height: 1, backgroundColor: RULE, marginVertical: 14 },

  specWrap: { borderTopWidth: 1.5, borderTopColor: INK },
  specRow:  { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: RULE },
  specAlt:  { backgroundColor: BG },
  specLast: { borderBottomWidth: 0 },
  specKey:  { width: '44%', padding: '7 10', fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: INK, borderRightWidth: 1, borderRightColor: RULE },
  specVal:  { flex: 1, padding: '7 10', fontSize: 8.5, color: BODY },

  /* ── FOOTER ── */
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopWidth: 1, borderTopColor: RULE,
    paddingHorizontal: 40, paddingVertical: 11,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  footLeft:  { fontSize: 7.5, color: MUTED },
  footRight: { fontSize: 7.5, color: MUTED },
});

export function ProductPDF({ product: p }: { product: Product }) {
  const mainImg = p.images?.[0]?.url ?? null;
  const thumbs  = (p.images ?? []).slice(1, 4);

  const specRows = [
    ['Category',     p.catName || p.cat],
    ['Product type', p.subName],
    ...(p.brand ? [['Brand', p.brandName ?? p.brand ?? '']] : []),
    ...Object.entries(p.specs ?? {}),
  ].filter(([, v]) => v) as [string, string][];

  return (
    <Document title={`${p.name} — Hirani Marketing Combines`} author="Hirani Marketing Combines">
      <Page size="A4" style={s.page}>

        {/* ── HEADER ── */}
        <View style={s.header}>

          {/* Logo + tagline */}
          <View style={s.logoSide}>
            <View style={s.logoRow}>
              <Image src={LOGO_MARK} style={s.logoMark} />
              <Image src={LOGO_WORDMARK} style={s.logoWordmark} />
            </View>
            <Text style={s.tagline}>Pumps · Water Systems · Industrial Equipment · Est. 2008</Text>
          </View>

          {/* Contact info — one label per line, no wrapping */}
          <View style={s.contactSide}>
            <View style={s.contactRow}>
              <Text style={s.cLabel}>Phone</Text>
              <Text style={s.cValue}>+91 98401 59762</Text>
            </View>
            <View style={s.contactRow}>
              <Text style={s.cLabel}>Email</Text>
              <Text style={s.cValue}>{CONTACT.email}</Text>
            </View>
            <View style={s.contactRow}>
              <Text style={s.cLabel}>Address</Text>
              <Text style={s.cValue}>Old No.133 / New No.279, Thambu Chetty St,{'\n'}Parrys, Chennai – 600001</Text>
            </View>
          </View>

        </View>

        {/* ── BODY ── */}
        <View style={s.body}>

          <Text style={s.productName}>{p.name}</Text>

          <View style={s.metaRow}>
            {p.catName && (
              <View style={s.metaChip}>
                <Text style={s.metaLabel}>Category</Text>
                <Text style={s.metaValue}>{p.catName}</Text>
              </View>
            )}
            {p.catName && p.brand && <View style={s.metaPipe} />}
            {p.brand && (
              <View style={s.metaChip}>
                <Text style={s.metaLabel}>Brand</Text>
                <Text style={s.metaValue}>{p.brandName ?? p.brand}</Text>
              </View>
            )}
            {(p.catName || p.brand) && p.subName && <View style={s.metaPipe} />}
            {p.subName && (
              <View style={s.metaChip}>
                <Text style={s.metaLabel}>Type</Text>
                <Text style={s.metaValue}>{p.subName}</Text>
              </View>
            )}
          </View>

          <View style={s.priceRow}>
            <View>
              <Text style={s.priceLabel}>{p.price ? 'Starting from' : 'Pricing'}</Text>
              <Text style={s.priceValue}>
                {p.price ? `Rs. ${p.price.toLocaleString('en-IN')}` : 'On request'}
              </Text>
            </View>
            <Text style={s.priceNote}>
              Prices vary by capacity, material and specification.{'\n'}Contact us for a confirmed quote before ordering.
            </Text>
          </View>

          <View style={s.cols}>
            <View style={s.colLeft}>
              {mainImg
                ? <Image src={mainImg} style={s.mainImg} />
                : <View style={s.noImg}><Text style={s.noImgTxt}>No image available</Text></View>
              }
              {thumbs.length > 0 && (
                <View style={s.thumbRow}>
                  {thumbs.map((img, i) => <Image key={i} src={img.url} style={s.thumbImg} />)}
                </View>
              )}
            </View>

            <View style={s.colRight}>
              {p.desc && (
                <>
                  <Text style={s.secHead}>Description</Text>
                  <Text style={s.descText}>{p.desc}</Text>
                  {specRows.length > 0 && <View style={s.infoRule} />}
                </>
              )}
              {specRows.length > 0 && (
                <>
                  <Text style={s.secHead}>Specifications</Text>
                  <View style={s.specWrap}>
                    {specRows.map(([k, v], i) => (
                      <View key={k} style={[
                        s.specRow,
                        i % 2 === 1 ? s.specAlt : {},
                        i === specRows.length - 1 ? s.specLast : {},
                      ]}>
                        <Text style={s.specKey}>{k}</Text>
                        <Text style={s.specVal}>{v}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          </View>

        </View>

        {/* ── FOOTER ── */}
        <View style={s.footer} fixed>
          <Text style={s.footLeft}>Hirani Marketing Combines — Product Datasheet</Text>
          <Text style={s.footRight}>For reference only. Specifications subject to change without notice.</Text>
        </View>

      </Page>
    </Document>
  );
}
