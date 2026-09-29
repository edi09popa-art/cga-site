/* CGA Cargo Go Ahead · hero map, languages, fleet picker, road. Plain JS, no build step. */
(() => {
  'use strict';
  const doc = document, root = doc.documentElement;
  const $ = (s, r = doc) => r.querySelector(s);
  const $$ = (s, r = doc) => Array.from(r.querySelectorAll(s));
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (p, e0, e1) => { const t = clamp((p - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
  const ease5 = t => t * t * t * (t * (t * 6 - 15) + 10);
  const rng = seed => { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };
  const hash = str => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };
  const onMQ = (m, fn) => (m.addEventListener ? m.addEventListener('change', fn) : m.addListener(fn));

  /* The static-hero gates. These strings match the CSS media queries exactly. */
  const GATES = [
    '(prefers-reduced-motion: reduce)',
    '(orientation: landscape) and (pointer: coarse) and (max-height: 560px)'
  ];
  const MQLS = GATES.map(q => matchMedia(q));
  const RM = MQLS[0];
  const NARROW = matchMedia('(max-width: 900px)');

  /* ---------------- language ---------------- */
  const LOCALE = { ro: 'ro-RO', en: 'en-GB', de: 'de-DE' };
  const EN = {
    'meta.title': 'CGA Cargo Go Ahead · Join our fleet with your van',
    'meta.desc': 'CGA is a freight forwarder based in Bucharest. We are looking for partners with vans, from 2-pallet Caddy vans to 8-pallet curtainsiders, for runs across Europe. Dispatch 24/7.',
    'nav.skip': 'Skip to content', 'nav.1': 'How it works', 'nav.2': 'Fleet', 'nav.3': 'Team', 'nav.4': 'FAQ', 'nav.5': 'Contact', 'nav.cta': 'Become a partner',
    'aria.nav': 'Main', 'aria.lang': 'Language', 'aria.hero': 'Intro',
    'h.b1a': 'You have a van. We have the runs.', 'h.b1b': 'CGA is a freight forwarder based in Bucharest. We find the cargo, you take it to its destination.',
    'h.b2a': 'You’re not alone on the road.', 'h.b2b': 'Our dispatch team is with you 24/7, from loading to delivery.',
    'h.b3a': 'Runs across Europe.', 'h.b3b': 'Our clients ship goods to 18 countries.',
    'h.kick': 'Delivered · Bucharest → Paris', 'h.h1': 'Join the CGA fleet.',
    'h.sub': 'We are looking for partners with vans, from 2-pallet Caddy vans to 8-pallet curtainsiders. We find the runs, you drive.',
    'h.cta': 'Become a partner', 'h.call': 'Call: +40 799 752 124', 'h.cue': 'Scroll',
    'st.k': 'In numbers', 'st.h': 'On Europe’s roads since 2016.', 'st.1l': 'kilometres driven', 'st.2l': 'transports delivered', 'st.3l': 'complaints', 'st.4l': 'countries we drive to often',
    'st.cap': 'CGA vans, ready to go.', 'st.alt': 'White vans with the CGA logo, parked side by side.',
    'md.k': 'How it works', 'md.h': 'We find the cargo. You deliver it.', 'md.p': 'CGA is a freight forwarder. We work with partners who join our fleet with their own vans.',
    'md.1t': 'Clients hand us the cargo', 'md.1d': 'Companies across Europe trust us with their shipments, many of them urgent.',
    'md.2t': 'We pass it to the fleet', 'md.2d': 'Our dispatchers match every run with a van from the CGA fleet.',
    'md.3t': 'You deliver it', 'md.3d': 'Load, drive, deliver. You see your orders and documents in the portal.',
    'fl.k': 'Fleet', 'fl.h': 'What van do you have?', 'fl.p': 'Pick your van and watch it join the CGA fleet.', 'fl.label': 'How many Euro pallets fit in your van?',
    'fl.c2': '2 Euro pallets', 'fl.c5': '5 Euro pallets', 'fl.c6': '6 Euro pallets', 'fl.c7': '7 Euro pallets', 'fl.c8': '8 Euro pallets',
    'fl.fine': 'These are the vans we take into the fleet.', 'fl.cta': 'Sign up with your van',
    'bn.k': 'Benefits', 'bn.h': 'What you get as a CGA partner.', 'bn.p': 'The short version. We go through the rest with you on the phone.',
    'bn.1t': 'Runs across Europe', 'bn.1d': 'Our clients ship goods to 18 countries. We find the orders, you drive.',
    'bn.2t': 'Dispatch 24/7', 'bn.2d': 'Someone from our team is with you on the road, Sundays and public holidays included.',
    'bn.3t': 'The CGA portal', 'bn.3d': 'Your orders, documents and invoices in one place. You log in with your company’s tax ID.',
    'bn.4t': 'A clear contract', 'bn.4d': 'The partnership starts with a signed contract, sent by email.',
    'tm.k': 'Team', 'tm.h': 'Real people, one phone call away.',
    'tm.p': 'Our dispatch team in Bucharest is behind every run. When you call, you talk to someone who knows where you are and what comes next.',
    'tm.cap': 'Claudiu Oprea, founder and CEO', 'tm.alt': 'Claudiu Oprea, founder of CGA, at the dispatch desk with a map of Europe on the screen.',
    'tm.r1': 'Commercial Director', 'tm.r2': 'Operations Manager', 'tm.r3': 'Operations Specialist', 'tm.r4': 'Operations',
    'in.k': 'Sign-up', 'in.h': 'Join the fleet in four steps.',
    'in.1t': 'You register', 'in.1d': 'Fill in the form: your company, tax ID, how many vans you have and what type.',
    'in.2t': 'We validate your account', 'in.2d': 'We check your details and you get a notification when your account is active.',
    'in.3t': 'We complete the paperwork', 'in.3d': 'A colleague calls you about your company details and documents.',
    'in.4t': 'We sign the contract', 'in.4d': 'The contract arrives by email and we hit the road.',
    'in.cta': 'Registration form',
    'fq.k': 'Questions', 'fq.h': 'What partners ask us.',
    'fq.1q': 'Which vans do you accept?', 'fq.1a': 'Caddy vans for 2 Euro pallets, Sprinter vans for 5, 6 or 7 and curtainsider vans for 8.',
    'fq.2q': 'Do I need a company?', 'fq.2a': 'Yes. We work with registered companies, based on their tax ID. You can join with one van or with several.',
    'fq.3q': 'Where do the runs go?', 'fq.3a': 'All over Europe. We often drive to Romania, Bulgaria, Hungary, Czechia, Slovakia, Poland, Germany, Austria, Belgium, France, Spain, Portugal, Italy, the United Kingdom, Sweden, Norway, the Netherlands and Denmark.',
    'fq.4q': 'How do I get runs?', 'fq.4a': 'From our dispatch team. You also see your orders, documents and invoices in the CGA portal, where you log in with your company’s tax ID.',
    'fq.5q': 'Which documents do I need?', 'fq.5a': 'Once your account is validated, a colleague calls you and tells you exactly which documents we need for your company and your vans.',
    'fq.6q': 'Will I have support on the road?', 'fq.6a': 'Yes. Our dispatch team answers 24/7, Sundays and public holidays included.',
    'fq.7q': 'How are runs paid?', 'fq.7a': 'We go through the terms of the partnership and of payment with you directly, on the phone, and write them into the contract.',
    'ct.k': 'Contact', 'ct.h': 'Let’s talk about your van.', 'ct.p': 'Call us or write to us. We answer any question about working together.',
    'ct.phone': 'Phone', 'ct.email': 'Email', 'ct.addr': 'Address', 'ct.hours': 'Office hours', 'ct.hoursV': 'Monday–Friday, 09:00–⁠18:00', 'ct.disp': 'Dispatch',
    'ct.client': 'Already a CGA client?', 'cr.b2': 'Carrier login',
    'ft.tag': 'Freight forwarding and express transport across Europe, since 2016.', 'ft.partners': 'Partners', 'ft.co': 'Company', 'ft.guides': 'Guides', 'ft.clients': 'Clients',
    'ft.about': 'About us', 'ft.g1': 'INCOTERMS explained', 'ft.g2': 'Road freight glossary', 'ft.g3': 'KPIs in logistics', 'ft.g4': 'Truck speed limits in Europe',
    'ft.p1': 'Client login', 'ft.copy': '© 2026 CGA Trans Experience SRL. All rights reserved.', 'ft.terms': 'Terms and conditions', 'ft.cookies': 'Cookie policy'
  };
  const DE = {
    'meta.title': 'CGA Cargo Go Ahead · Mit Ihrem Transporter in unsere Flotte',
    'meta.desc': 'CGA ist eine Spedition mit Sitz in Bukarest. Wir suchen Partner mit Transportern, vom Caddy für 2 Europaletten bis zum Planenfahrzeug für 8, für Fahrten in ganz Europa. Disposition rund um die Uhr.',
    'nav.skip': 'Zum Inhalt springen', 'nav.1': 'So läuft’s', 'nav.2': 'Flotte', 'nav.3': 'Team', 'nav.4': 'Fragen', 'nav.5': 'Kontakt', 'nav.cta': 'Partner werden',
    'aria.nav': 'Hauptmenü', 'aria.lang': 'Sprache', 'aria.hero': 'Einleitung',
    'h.b1a': 'Sie haben den Transporter. Wir haben die Fahrten.', 'h.b1b': 'CGA ist eine Spedition aus Bukarest. Wir finden die Ware, Sie bringen sie ans Ziel.',
    'h.b2a': 'Unterwegs sind Sie nicht allein.', 'h.b2b': 'Unsere Disposition ist rund um die Uhr für Sie da, von der Beladung bis zur Zustellung.',
    'h.b3a': 'Fahrten in ganz Europa.', 'h.b3b': 'Unsere Kunden versenden Ware in 18 Länder.',
    'h.kick': 'Zugestellt · Bukarest → Paris', 'h.h1': 'Werden Sie CGA-Partner.',
    'h.sub': 'Wir suchen Partner mit Transportern, vom Caddy für 2 Europaletten bis zum Planenfahrzeug für 8. Wir finden die Fahrten, Sie fahren.',
    'h.cta': 'Partner werden', 'h.call': 'Anrufen: +40 799 752 124', 'h.cue': 'Scrollen',
    'st.k': 'In Zahlen', 'st.h': 'Seit 2016 auf Europas Straßen.', 'st.1l': 'gefahrene Kilometer', 'st.2l': 'zugestellte Transporte', 'st.3l': 'Reklamationen', 'st.4l': 'Länder, in die wir oft fahren',
    'st.cap': 'CGA-Transporter, startklar.', 'st.alt': 'Weiße Transporter mit CGA-Logo, nebeneinander geparkt.',
    'md.k': 'So läuft’s', 'md.h': 'Wir finden die Ware. Sie liefern sie.', 'md.p': 'CGA ist eine Spedition. Wir arbeiten mit Partnern, die mit ihren eigenen Transportern Teil unserer Flotte werden.',
    'md.1t': 'Kunden geben uns die Ware', 'md.1d': 'Unternehmen aus ganz Europa vertrauen uns ihre Sendungen an, viele davon eilig.',
    'md.2t': 'Wir geben sie an die Flotte', 'md.2d': 'Unsere Disponenten ordnen jeder Fahrt einen Transporter aus der CGA-Flotte zu.',
    'md.3t': 'Sie liefern sie', 'md.3d': 'Laden, fahren, zustellen. Aufträge und Dokumente sehen Sie im Portal.',
    'fl.k': 'Flotte', 'fl.h': 'Welchen Transporter haben Sie?', 'fl.p': 'Wählen Sie Ihren Transporter und sehen Sie, wie er Teil der CGA-Flotte wird.', 'fl.label': 'Wie viele Europaletten passen in Ihren Transporter?',
    'fl.c2': '2 Europaletten', 'fl.c5': '5 Europaletten', 'fl.c6': '6 Europaletten', 'fl.c7': '7 Europaletten', 'fl.c8': '8 Europaletten',
    'fl.fine': 'Diese Transporter nehmen wir in die Flotte auf.', 'fl.cta': 'Mit Ihrem Transporter anmelden',
    'bn.k': 'Vorteile', 'bn.h': 'Das bekommen Sie als CGA-Partner.', 'bn.p': 'Das Wichtigste in Kürze. Den Rest besprechen wir mit Ihnen am Telefon.',
    'bn.1t': 'Fahrten in ganz Europa', 'bn.1d': 'Unsere Kunden versenden Ware in 18 Länder. Wir finden die Aufträge, Sie fahren.',
    'bn.2t': 'Disposition rund um die Uhr', 'bn.2d': 'Jemand aus unserem Team ist unterwegs für Sie da, auch sonntags und an Feiertagen.',
    'bn.3t': 'Das CGA-Portal', 'bn.3d': 'Ihre Aufträge, Dokumente und Rechnungen an einem Ort. Sie melden sich mit der Steuernummer Ihrer Firma an.',
    'bn.4t': 'Ein klarer Vertrag', 'bn.4d': 'Die Zusammenarbeit beginnt mit einem unterschriebenen Vertrag, den wir per E-Mail schicken.',
    'tm.k': 'Team', 'tm.h': 'Echte Menschen, einen Anruf entfernt.',
    'tm.p': 'Unsere Disposition in Bukarest begleitet jede Fahrt. Wenn Sie anrufen, spricht jemand mit Ihnen, der weiß, wo Sie sind und was als Nächstes kommt.',
    'tm.cap': 'Claudiu Oprea, Gründer und CEO', 'tm.alt': 'Claudiu Oprea, Gründer von CGA, am Dispositionsplatz mit einer Europakarte auf dem Bildschirm.',
    'tm.r1': 'Leitung Vertrieb', 'tm.r2': 'Operations Manager', 'tm.r3': 'Operations Specialist', 'tm.r4': 'Operations',
    'in.k': 'Anmeldung', 'in.h': 'In vier Schritten in die Flotte.',
    'in.1t': 'Sie registrieren sich', 'in.1d': 'Sie füllen das Formular aus: Firma, Steuernummer, wie viele Transporter Sie haben und welchen Typ.',
    'in.2t': 'Wir prüfen Ihr Konto', 'in.2d': 'Wir prüfen Ihre Angaben, und Sie erhalten eine Nachricht, sobald Ihr Konto aktiv ist.',
    'in.3t': 'Wir ergänzen die Unterlagen', 'in.3d': 'Ein Kollege ruft Sie wegen Firmendaten und Dokumenten an.',
    'in.4t': 'Wir unterschreiben den Vertrag', 'in.4d': 'Der Vertrag kommt per E-Mail, und es geht los.',
    'in.cta': 'Zur Registrierung',
    'fq.k': 'Fragen', 'fq.h': 'Was Partner uns fragen.',
    'fq.1q': 'Welche Transporter nehmen Sie?', 'fq.1a': 'Caddy-Transporter für 2 Europaletten, Sprinter-Transporter für 5, 6 oder 7 und Planentransporter für 8.',
    'fq.2q': 'Brauche ich eine Firma?', 'fq.2a': 'Ja. Wir arbeiten mit eingetragenen Firmen, anhand ihrer Steuernummer. Sie können mit einem Transporter einsteigen oder mit mehreren.',
    'fq.3q': 'Wohin gehen die Fahrten?', 'fq.3a': 'In ganz Europa. Regelmäßig fahren wir in diese Länder: Rumänien, Bulgarien, Ungarn, Tschechien, Slowakei, Polen, Deutschland, Österreich, Belgien, Frankreich, Spanien, Portugal, Italien, Vereinigtes Königreich, Schweden, Norwegen, Niederlande und Dänemark.',
    'fq.4q': 'Wie bekomme ich Fahrten?', 'fq.4a': 'Über unsere Disposition. Aufträge, Dokumente und Rechnungen sehen Sie außerdem im CGA-Portal, wo Sie sich mit der Steuernummer Ihrer Firma anmelden.',
    'fq.5q': 'Welche Dokumente brauche ich?', 'fq.5a': 'Nachdem wir Ihr Konto geprüft haben, ruft Sie ein Kollege an und sagt Ihnen genau, welche Unterlagen wir für Ihre Firma und Ihre Transporter brauchen.',
    'fq.6q': 'Habe ich unterwegs Unterstützung?', 'fq.6a': 'Ja. Unsere Disposition ist rund um die Uhr erreichbar, auch sonntags und an Feiertagen.',
    'fq.7q': 'Wie werden die Fahrten bezahlt?', 'fq.7a': 'Die Bedingungen der Zusammenarbeit und der Bezahlung besprechen wir direkt mit Ihnen am Telefon und halten sie im Vertrag fest.',
    'ct.k': 'Kontakt', 'ct.h': 'Sprechen wir über Ihren Transporter.', 'ct.p': 'Rufen Sie an oder schreiben Sie uns. Wir beantworten jede Frage zur Zusammenarbeit.',
    'ct.phone': 'Telefon', 'ct.email': 'E-Mail', 'ct.addr': 'Adresse', 'ct.hours': 'Bürozeiten', 'ct.hoursV': 'Montag–Freitag, 09:00–⁠18:00', 'ct.disp': 'Disposition',
    'ct.client': 'Schon CGA-Kunde?', 'cr.b2': 'Partner-Login',
    'ft.tag': 'Spedition und Expresstransport in ganz Europa, seit 2016.', 'ft.partners': 'Partner', 'ft.co': 'Unternehmen', 'ft.guides': 'Ratgeber', 'ft.clients': 'Kunden',
    'ft.about': 'Über uns', 'ft.g1': 'INCOTERMS erklärt', 'ft.g2': 'Glossar Straßengüterverkehr', 'ft.g3': 'KPIs in der Logistik', 'ft.g4': 'Lkw-Tempolimits in Europa',
    'ft.p1': 'Kunden-Login', 'ft.copy': '© 2026 CGA Trans Experience SRL. Alle Rechte vorbehalten.', 'ft.terms': 'AGB', 'ft.cookies': 'Cookie-Richtlinie'
  };
  const DYN = {
    ro: {
      done: 'LIVRAT',
      cities: { buc: 'BUCUREȘTI', arad: 'ARAD', bud: 'BUDAPESTA', vie: 'VIENA', muc: 'MÜNCHEN', stu: 'STUTTGART', par: 'PARIS' },
      vans: { 2: ['Dubă Caddy', '2 europaleți'], 5: ['Dubă Sprinter', '5 europaleți · până la 1.250 kg'], 6: ['Dubă Sprinter', '6 europaleți · până la 1.050 kg'], 7: ['Dubă Sprinter', '7 europaleți · până la 900 kg'], 8: ['Prelată', '8 europaleți · 850–⁠1.000 kg'] },
      vanDesc: 'Duba ta se potrivește în flota CGA.'
    },
    en: {
      done: 'DELIVERED',
      cities: { buc: 'BUCHAREST', arad: 'ARAD', bud: 'BUDAPEST', vie: 'VIENNA', muc: 'MUNICH', stu: 'STUTTGART', par: 'PARIS' },
      vans: { 2: ['Caddy van', '2 Euro pallets'], 5: ['Sprinter van', '5 Euro pallets · up to 1,250 kg'], 6: ['Sprinter van', '6 Euro pallets · up to 1,050 kg'], 7: ['Sprinter van', '7 Euro pallets · up to 900 kg'], 8: ['Curtainsider van', '8 Euro pallets · 850–⁠1,000 kg'] },
      vanDesc: 'Your van fits the CGA fleet.'
    },
    de: {
      done: 'ZUGESTELLT',
      cities: { buc: 'BUKAREST', arad: 'ARAD', bud: 'BUDAPEST', vie: 'WIEN', muc: 'MÜNCHEN', stu: 'STUTTGART', par: 'PARIS' },
      vans: { 2: ['Caddy-Transporter', '2 Europaletten'], 5: ['Sprinter-Transporter', '5 Europaletten · bis 1.250 kg'], 6: ['Sprinter-Transporter', '6 Europaletten · bis 1.050 kg'], 7: ['Sprinter-Transporter', '7 Europaletten · bis 900 kg'], 8: ['Planentransporter', '8 Europaletten · 850–⁠1.000 kg'] },
      vanDesc: 'Ihr Transporter passt in die CGA-Flotte.'
    }
  };
  const RO = {};
  const DICT = { ro: RO, en: EN, de: DE };
  let lang = 'ro';
  const tr = k => (DICT[lang][k] != null ? DICT[lang][k] : RO[k]);
  const D = () => DYN[lang];
  const metaDesc = $('meta[name="description"]');
  let nfCache = {};
  const fmt = (v, dec = 0) => {
    const key = lang + dec;
    if (!nfCache[key]) nfCache[key] = new Intl.NumberFormat(LOCALE[lang], { minimumFractionDigits: dec, maximumFractionDigits: dec });
    return nfCache[key].format(v);
  };

  function snapshotRO() {
    $$('[data-i18n]').forEach(el => { const k = el.dataset.i18n; if (!(k in RO)) RO[k] = el.textContent.trim(); });
    $$('[data-i18n-ph]').forEach(el => { RO[el.dataset.i18nPh] = el.getAttribute('placeholder'); });
    $$('[data-i18n-aria]').forEach(el => { RO[el.dataset.i18nAria] = el.getAttribute('aria-label'); });
    $$('[data-i18n-alt]').forEach(el => { RO[el.dataset.i18nAlt] = el.getAttribute('alt'); });
    RO['meta.title'] = doc.title;
    RO['meta.desc'] = metaDesc.content;
  }

  /* split a headline into words and characters, seeded so every load looks the same */
  function splitEl(el) {
    const text = el.dataset.src;
    const mode = el.dataset.fx;
    const r = rng(hash(text));
    const sr = doc.createElement('span'); sr.className = 'sr-only'; sr.textContent = text;
    const vis = doc.createElement('span'); vis.className = 'vis'; vis.setAttribute('aria-hidden', 'true');
    const words = text.split(/\s+/);
    const total = Math.max(1, text.replace(/\s+/g, '').length);
    let ci = 0;
    words.forEach((w, wi) => {
      const ws = doc.createElement('span'); ws.className = 'w';
      if (mode === 'drift' || mode === 'rise') {
        const spread = mode === 'rise' ? 0.4 : 0.45;
        const th = words.length > 1 ? (wi / (words.length - 1)) * spread : 0;
        ws.style.setProperty('--th', th.toFixed(3));
        ws.textContent = w;
      } else {
        for (const ch of w) {
          const c = doc.createElement('span'); c.className = 'c'; c.textContent = ch;
          if (mode === 'scatter') {
            c.style.cssText = `--th:${(r() * 0.5).toFixed(3)};--jx:${((r() - 0.5) * 90).toFixed(1)}px;--jy:${((r() - 0.5) * 70).toFixed(1)}px;--jr:${((r() - 0.5) * 56).toFixed(1)}deg`;
          } else {
            c.style.cssText = `--th:${((ci / total) * 0.45 + r() * 0.06).toFixed(3)};--jx:${(22 + r() * 38).toFixed(1)}px`;
          }
          ws.appendChild(c); ci++;
        }
      }
      vis.appendChild(ws);
      if (wi < words.length - 1) vis.appendChild(doc.createTextNode(' '));
    });
    el.textContent = '';
    el.append(sr, vis);
  }

  let regionNames = null;
  function applyLang(l, save) {
    lang = DICT[l] ? l : 'ro';
    root.lang = lang;
    $$('[data-i18n]').forEach(el => {
      const v = tr(el.dataset.i18n);
      if (v == null) return;
      if (el.classList.contains('split')) { if (el.dataset.src !== v) { el.dataset.src = v; splitEl(el); } }
      else if (el.textContent !== v) el.textContent = v;
    });
    $$('[data-i18n-ph]').forEach(el => el.setAttribute('placeholder', tr(el.dataset.i18nPh)));
    $$('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', tr(el.dataset.i18nAria)));
    $$('[data-i18n-alt]').forEach(el => el.setAttribute('alt', tr(el.dataset.i18nAlt)));
    regionNames = null;
    if (lang !== 'ro' && typeof Intl.DisplayNames === 'function') { try { regionNames = new Intl.DisplayNames([LOCALE[lang]], { type: 'region' }); } catch (e) { regionNames = null; } }
    $$('.countries li').forEach(li => {
      if (!li.dataset.ro) li.dataset.ro = li.textContent;
      li.textContent = regionNames ? regionNames.of(li.dataset.cc) : li.dataset.ro;
    });
    $$('.rotag').forEach(t => { t.hidden = lang === 'ro'; });
    doc.title = tr('meta.title');
    metaDesc.content = tr('meta.desc');
    $$('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    if (save) store.set('cga-lang', lang);
    nfCache = {};
    renderCounters();
    hudKey = '';
    baseKey = '';
    renderFleet(false);
    bands.forEach(B => { B.op = -1; B.k = -1; });
    updateCaptions(staticMode ? 1 : shown);
    if (staticMode) drawStatic(); else { drawScene(shown, performance.now(), false); kick(); }
  }

  /* ---------------- the map data: Natural Earth land, bit-packed dot grid ---------------- */
  const MAP = { LON0: -26, LAT0: 71.5, K: 0.669131, STEP: 0.3, ROWS: 139, COLS: 166, B64: 'A/3///////////////////////8/Bvz///////////////////////8/8wMAAEAAAAAAAAAAAACKAwAAAAAA4AMAAAAAAAAAAAAAANjXHQAAAAAABgAAAAAAAAAAAAAAALD//wAAAAAA/wAAAAAAAAAAAAAAMPr/DwAAAAAAHwAAAAAAAAAAAAAAuP///w8AAAAABwAAAAAAAAAAAAAA9v///x8AAAAAAwAAAAAAAAAAAAAg/f///+8HAAAA//////////////+TAQAAAADg//8///////////////9PAAAAAAAA/w8+//////////////8aAAAAAAAA/h8+/////////////38PAAAAAAAA8B84//////////////8PAAAAAAAA4I8f//////////////8HAAAAAAAAwI8f//////////////8BAAAAAAQAwB8P//////////////8AAAAAAHAAwD8Af/+f/////////38AAAAAAOAB8BgAv/wK/v///////z8AAAAAAIB/fhAAH1wC/v///////z8AAFAAAAD/DwAAzwkA8P///////z8AAPgHAAD/BwAA/wAA+P///////z8AAPwDAID/BwAA4P//DwAAAAAAAPj//wP4//9w4P8/AP3/AwAAAAAAAPj//wP////w+/8/APz/AQAAAAAAAPz//wP///+H//8/gP8/AAAAAAAAAPf//8H///+H//8/AOAHAAAAAAAAIPv//+D///////8/AAAAAAAAAAAA6P//H/D///////8/AAAAAAAAAAAA6P//D/j///////8/AAAAAAAAAAAA/v//B/7///////8/AAAAAAAAAAAA////A/z///////8/AAAAAAAMAADA////Afz///////8/AAAAAAAAAACA////Afz///////8/AAAAAAAAAADg////APz///////8/AAAAAAAAAADA////Afz///////8/AAAAAAAAAADg////APz///////8/AAAAAAAAAAHA////Afz///////8/AAAAAAAAgADg////B/AP/P////8/AAAAAAAAAACA////D8AB4P////8/AAAAAAAAAAAg////DwAA/v////8/AAAAAAAAAADA/v//DwA8/v////8/AAAAAAAAAACg//3/B8D///////8/AAAAAAAAAACA//j/A7D///////8/AAAAAAAABACAP/h/AJD///////8/AAAAAACYBwAAHvD/ABj///////8/AAAAAADMAQAAAPB/AAD///////8/AAAAAADAAQAAAOB/CBD+//////8/AAAAAADoPwAAAOF/DBz///////8/AAAAAADAPwAAwMN/CDz///////8/AAAAAADgHwAAsMF/AP7///////8/AAAAAADgDwAA4If/AP7///////8/AAAAAADADwAA8ME/AP7///////8/AAAAAAAAPwAA4LEDAP7///////8/AAAAAADgPwAA8LgDAP7///////8/AAAAAAAEfwAAwD4AAPz///////8/AAAAAICffwAA4DAAAP7///////8/AAAAAICf+AAA4BEAjv////////8/AAAAAIAf/AEA4MHA7/////////8/AAAAAPAf8AMAwOfx//////////8/AAAAAOAP+AMA4P/9//////////8/AAAAAPAf8AcA3f////////////8/AAAAAMAP/wfA//////////////8/AAAAAMAf/zfg//////////////8/AAAAAOAP/j/w//////////////8/AAAAAOAP/j/w//////////////8/AAAAAPiB/x/4//////////////8/AAAAAPCA/g/w//////////////8/AAAAAAAA9Af4//////////////8/AAAAAAAA/h////////////////8/AAAAAAAAf8X///////////////8/AAAAAACAB8D///////////////8/AAAAAABAAOD///////////////8/AAAAAAAAAPD///////////////8/AAAAAAAAQPz///////////////8/AAAAAAAAgP////////////////8/AAAAAAAAwP////////////////8/AAAAAAAAjv////////////////8/AAAAAACA//////////////////8/AAAAAAAA//////////////////8/AAAAAAAA/P////////////////8/AAAAAAAA4P////////////////8/AAAAAAAA4P///////////////f8/AAAAAAAAwP////////////8f/v8/AAAAAAAAwP//////////f/jD//8/AAAAAAAAAP//////////f/4B//8/AAAAAAAAAP//////////P+CA//8/AAAAAAAAAP/////+////H/CB//8fAAAAAAAAgP///x//////D/jN//8PAAAAAAAAAP///z/2////H+Dv//8PAAAAAAAAgP///x/4////A2Dg//8HAAAAAAAAAP///z/w////B2CA//8HAAAAAAAAgP//nz/w////AwAA/v8HAAAAAAAAgP//D37g////AwAA/P8PAAAAAAATgP//A/7A////AwAA+P8PAAAAAID////DAfyB////AQAA8P8PAAAAAOD///8BAP4B////AAAA4P8PAAAAAMD///8BgPgD+P//AAAAgP8fAAAAAID///8BYPgD8P//AAAAgP8fAAAAAID///8DwOAH4P//AQAAgP8/AAAAAMD///8BYOA/wP//APgBgP8/AAAAAID///8AQIA/wP//A/wHgP8/AAAAAID//z8AQAB+4P//D/8f4P8/AAAAAID//w8AwAD8wf/78P////8/AAAAAMD//wcA8AD4438A/P////8/AAAAAID//wcA4ADwzF/h//////8/AAAAAMD//wMA4ABgxE/w//////8/AAAAAMD//wMD4ABAwD/g//////8/AAAAAOD//wEBYADAgD/A//////8/AAAAAOD//wMAYADAAT7g//////8/AAAAAOD//wMAAABAAF/A//////8/AAAAAMD//wMAAABAAP7w//////8/AAAAAMD//wEAAAAwgOzg//////8/AAAAAID//wEAAMAfALyA//////8/AAAAAMD//wAAAMAPADyQ//////8/AAAAAID/fwAAAAAOABgA//////8/AAAAAAD4PwAAxQUMABwA/v////8/AAAAAADwAQC+/wcAADAAeH76//8/AAAAAAAwAPD//wMAAAAAODz8//8/AAAAAAAgAPj//wMAAAAAAQj4//8/AAAAAAAgAP7//wMAAAAAAAD8//8/AAAAAABgAP///wcAAIAAAAD8//8/AAAAAADwzv///wcAAAAXADj8//8/AAAAAADw/////wcAAAAAABj4//8/AAAAAADw/////wMAAAAAAAj8//8/AAAAAADw/////wEAAAAAAAD8//8/AAAAAAD4/////wAAAAAAAAD+//8/AAAAAAD8/////wMAAAAAAAD8//8/AAAAAAD//////wcAAAAAAAD+//8/AAAAAID//////x8AAAAAAAD+//8/AAAAAMD///////8AAAwAAAD///8/AAAAAMD///////8HAD8AAAD///8/AAAAAOD///////8PgD8AAAD///8/AAAAAOD///////8fgP8DAAD///8/AAAAAPD///////8fwP8DAID///8/AAAAAOD///////8/gP//wIH///8/AAAAAPD/////////gf//8/////8/AAAAAPD/////////h/////////8/AAAAAPD/////////z/////////8/AAAAAOD///////////////////8/' };
  const WX = lon => (lon - MAP.LON0) * MAP.K;
  const WY = lat => MAP.LAT0 - lat;
  let DOTX, DOTY, NDOT = 0;
  (function decodeMap() {
    const bin = atob(MAP.B64), bpr = Math.ceil(MAP.COLS / 8), xs = [], ys = [];
    for (let r = 0; r < MAP.ROWS; r++) {
      for (let c = 0; c < MAP.COLS; c++) {
        if ((bin.charCodeAt(r * bpr + (c >> 3)) >> (c & 7)) & 1) { xs.push((c + (r % 2) * 0.5) * MAP.STEP); ys.push(r * MAP.STEP); }
      }
    }
    DOTX = Float32Array.from(xs); DOTY = Float32Array.from(ys); NDOT = xs.length;
  })();

  /* the road from Bucharest to Paris, through Arad, Budapest, Vienna, Munich, Stuttgart */
  const ROUTE_LL = [[26.10, 44.43], [24.87, 44.86], [24.15, 45.79], [22.90, 45.88], [21.31, 46.17], [20.15, 46.25], [19.69, 46.90], [19.04, 47.50], [17.63, 47.68], [16.37, 48.21], [14.29, 48.31], [13.04, 47.81], [11.58, 48.14], [9.99, 48.40], [9.18, 48.78], [8.40, 49.01], [6.99, 49.24], [6.18, 49.12], [4.03, 49.26], [2.35, 48.86]];
  const ROUTE_KM = 2370;
  const RPTS = (() => {
    const P = ROUTE_LL.map(([lo, la]) => [WX(lo), WY(la)]);
    const out = [];
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      for (let j = 0; j < 10; j++) {
        const t = j / 10, t2 = t * t, t3 = t2 * t;
        out.push([
          0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
          0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
        ]);
      }
    }
    out.push(P[P.length - 1]);
    return out;
  })();
  const RLEN = (() => { const L = [0]; for (let i = 1; i < RPTS.length; i++) L.push(L[i - 1] + Math.hypot(RPTS[i][0] - RPTS[i - 1][0], RPTS[i][1] - RPTS[i - 1][1])); return L; })();
  const RTOT = RLEN[RLEN.length - 1];
  function routeAt(s) {
    const L = clamp(s, 0, 1) * RTOT;
    let lo = 0, hi = RLEN.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (RLEN[m] < L) lo = m; else hi = m; }
    const seg = Math.max(1e-6, RLEN[hi] - RLEN[lo]), f = (L - RLEN[lo]) / seg;
    const a = RPTS[lo], b = RPTS[hi];
    return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, ang: Math.atan2(b[1] - a[1], b[0] - a[0]), i: lo };
  }
  const CITIES = [['buc', 26.10, 44.43], ['arad', 21.31, 46.17], ['bud', 19.04, 47.50], ['vie', 16.37, 48.21], ['muc', 11.58, 48.14], ['stu', 9.18, 48.78], ['par', 2.35, 48.86]].map(([k, lo, la]) => {
    const x = WX(lo), y = WY(la);
    let best = 0, bd = 1e9;
    RPTS.forEach((p, i) => { const d = Math.hypot(p[0] - x, p[1] - y); if (d < bd) { bd = d; best = i; } });
    return { k, x, y, s: RLEN[best] / RTOT };
  });
  const HUBS = {
    buc: [26.10, 44.43], cta: [23.60, 46.77], tim: [21.23, 45.75], sof: [23.32, 42.70], bud: [19.04, 47.50], pra: [14.42, 50.08], bts: [17.11, 48.15], waw: [21.01, 52.23],
    ber: [13.40, 52.52], ham: [9.99, 53.55], fra: [8.68, 50.11], vie: [16.37, 48.21], bru: [4.35, 50.85], rot: [4.48, 51.92], par: [2.35, 48.86], lyo: [4.84, 45.76],
    mad: [-3.70, 40.42], bcn: [2.17, 41.39], lis: [-9.14, 38.72], mil: [9.19, 45.46], rom: [12.50, 41.90], lon: [-0.13, 51.51], sto: [18.07, 59.33], osl: [10.75, 59.91],
    cph: [12.57, 55.68], muc: [11.58, 48.14], cgn: [6.96, 50.94]
  };
  const NET = (() => {
    const pairs = [['buc', 'sof'], ['buc', 'bud'], ['tim', 'vie'], ['cta', 'pra'], ['buc', 'waw'], ['bud', 'ber'], ['vie', 'ham'], ['bud', 'fra'], ['buc', 'mil'], ['mil', 'lyo'], ['lyo', 'mad'],
      ['mad', 'lis'], ['lyo', 'bcn'], ['par', 'bru'], ['bru', 'rot'], ['rot', 'lon'], ['fra', 'cgn'], ['cgn', 'rot'], ['ham', 'cph'], ['cph', 'sto'], ['cph', 'osl'], ['ber', 'waw'], ['muc', 'rom'],
      ['mil', 'rom'], ['fra', 'muc'], ['pra', 'ber'], ['bts', 'waw'], ['par', 'lon']];
    const r = rng(2016);
    return pairs.map(([a, b], n) => {
      const A = [WX(HUBS[a][0]), WY(HUBS[a][1])], B = [WX(HUBS[b][0]), WY(HUBS[b][1])];
      const mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = B[0] - A[0], dy = B[1] - A[1], len = Math.hypot(dx, dy);
      const bow = (n % 2 ? 1 : -1) * len * 0.11;
      const C = [mx - (dy / len) * bow, my + (dx / len) * bow];
      const pts = new Float32Array(58);
      for (let i = 0; i <= 28; i++) { const t = i / 28, u = 1 - t; pts[i * 2] = u * u * A[0] + 2 * u * t * C[0] + t * t * B[0]; pts[i * 2 + 1] = u * u * A[1] + 2 * u * t * C[1] + t * t * B[1]; }
      return { pts, d: r() * 0.5, per: 5200 + r() * 5200, off: r(), dir: r() > 0.5 ? 1 : -1 };
    });
  })();
  const OVER = { x0: WX(-10.5), x1: WX(31), y0: WY(61.5), y1: WY(35.5) };

  /* ---------------- hero scene ---------------- */
  const hero = $('#hero'), stage = $('.stage'), canvas = $('#scene');
  let ctx = null;
  try { ctx = canvas.getContext('2d'); } catch (e) { ctx = null; }
  if (!ctx) stage.classList.add('scene-failed');
  const off = doc.createElement('canvas');
  const octx = off.getContext('2d');
  let W = 0, H = 0, DPR = 1, portrait = false, textR = 0, zF = 50, fAx = 0, fAy = 0, zO = 30, oAx = 0, oAy = 0, oCx = 0, oCy = 0, bgGrad = null, obgGrad = null, baseKey = '';
  const MONO = '"Martian Mono", ui-monospace, monospace';

  function buildScene() {
    if (!ctx) return;
    W = stage.clientWidth; H = stage.clientHeight;
    if (!W || !H) return;
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = off.width = Math.round(W * DPR); canvas.height = off.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); octx.setTransform(DPR, 0, 0, DPR, 0, 0);
    portrait = W <= 720;
    { const pad = clamp(W * 0.04, 20, 40); textR = portrait ? 0 : Math.max(pad, (W - 1200) / 2 + pad) + Math.min(620, W * 0.47); }
    let rx0, rx1, ry0, ry1;
    if (portrait) { zF = clamp(W / 11, 28, 44); fAx = W * 0.5; fAy = H * 0.7; rx0 = W * 0.02; rx1 = W * 0.98; ry0 = H * 0.44; ry1 = H * 0.97; }
    else { zF = clamp(Math.min(W, H * 1.7) / 24, 34, 64); fAx = W * 0.66; fAy = H * 0.54; rx0 = W * 0.42; rx1 = W * 0.985; ry0 = H * 0.09; ry1 = H * 0.97; }
    zO = Math.min((rx1 - rx0) / (OVER.x1 - OVER.x0), (ry1 - ry0) / (OVER.y1 - OVER.y0));
    oAx = (rx0 + rx1) / 2; oAy = (ry0 + ry1) / 2; oCx = (OVER.x0 + OVER.x1) / 2; oCy = (OVER.y0 + OVER.y1) / 2;
    const mk = g => {
      const gr = g.createRadialGradient(portrait ? W * 0.5 : W * 0.66, H * 0.5, 0, portrait ? W * 0.5 : W * 0.66, H * 0.5, Math.max(W, H) * 0.85);
      gr.addColorStop(0, '#13295B'); gr.addColorStop(0.5, '#0C1B3B'); gr.addColorStop(1, '#070F24');
      return gr;
    };
    bgGrad = mk(ctx); obgGrad = mk(octx);
    baseKey = '';
  }

  const sOf = p => { const u = clamp((p - 0.03) / 0.77, 0, 1); return 0.5 * u + 0.5 * u * u * (3 - 2 * u); };
  function cam(p) {
    const s = sOf(p), v = routeAt(s), ah = routeAt(Math.min(1, s + 0.05));
    const t = ease5(clamp((p - 0.74) / 0.21, 0, 1));
    const zIn = zF * (1 + 0.5 * (1 - smoothstep(p, 0, 0.16)));
    const z = Math.exp(Math.log(zIn) * (1 - t) + Math.log(zO) * t);
    return {
      s, v, t, z,
      cx: lerp(v.x + (ah.x - v.x) * 0.45, oCx, t), cy: lerp(v.y + (ah.y - v.y) * 0.45, oCy, t),
      ax: lerp(fAx, oAx, t), ay: lerp(fAy, oAy, t)
    };
  }

  const calm = sx => (textR ? clamp((sx - (textR - 80)) / 180, 0.12, 1) : 1);
  function drawBase(g, p, grad) {
    const C = cam(p);
    const X = x => C.ax + (x - C.cx) * C.z, Y = y => C.ay + (y - C.cy) * C.z;
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    // graticule, every 5 degrees
    g.strokeStyle = 'rgba(120,150,215,.075)'; g.lineWidth = 1; g.beginPath();
    for (let lon = -30; lon <= 50; lon += 5) { const x = Math.round(X(WX(lon))) + 0.5; if (x > -2 && x < W + 2) { g.moveTo(x, 0); g.lineTo(x, H); } }
    for (let lat = 25; lat <= 75; lat += 5) { const y = Math.round(Y(WY(lat))) + 0.5; if (y > -2 && y < H + 2) { g.moveTo(0, y); g.lineTo(W, y); } }
    g.stroke();
    // land dots
    const ds = clamp(C.z * MAP.STEP * (0.19 + C.t * 0.03), 0.9, 2.8), hd = ds / 2;
    const x0 = C.cx + (-C.ax - 6) / C.z, x1 = C.cx + (W - C.ax + 6) / C.z, y0 = C.cy + (-C.ay - 6) / C.z, y1 = C.cy + (H - C.ay + 6) / C.z;
    const round = ds > 1.8;
    g.fillStyle = `rgba(136,164,222,${(0.34 + C.t * 0.2).toFixed(3)})`; g.beginPath();
    for (let i = 0; i < NDOT; i++) {
      const x = DOTX[i], y = DOTY[i];
      if (x < x0 || x > x1 || y < y0 || y > y1) continue;
      if (round) { const sx = X(x), sy = Y(y); g.moveTo(sx + hd, sy); g.arc(sx, sy, hd, 0, 6.2832); }
      else g.rect(X(x) - hd, Y(y) - hd, ds, ds);
    }
    g.fill();
    // warm light pool and brighter dots around the vehicle while it travels
    const vx = X(C.v.x), vy = Y(C.v.y), follow = 1 - C.t;
    if (follow > 0.02) {
      const R = (portrait ? 150 : 230);
      const pool = g.createRadialGradient(vx, vy, 0, vx, vy, R);
      pool.addColorStop(0, `rgba(252,182,46,${(0.13 * follow).toFixed(3)})`); pool.addColorStop(1, 'rgba(252,182,46,0)');
      g.fillStyle = pool; g.fillRect(vx - R, vy - R, R * 2, R * 2);
      const Rw = R / C.z;
      for (let b = 0; b < 3; b++) {
        const lo = [0, 0.4, 0.7][b], hi = [0.4, 0.7, 1][b], a = [0.62, 0.38, 0.18][b] * follow;
        g.fillStyle = `rgba(214,225,250,${a.toFixed(3)})`; g.beginPath();
        for (let i = 0; i < NDOT; i++) {
          const dx = DOTX[i] - C.v.x, dy = DOTY[i] - C.v.y;
          if (Math.abs(dx) > Rw || Math.abs(dy) > Rw) continue;
          const d = Math.hypot(dx, dy) / Rw;
          if (d < lo || d >= hi) continue;
          const sx = X(DOTX[i]), sy = Y(DOTY[i]);
          if (round) { g.moveTo(sx + hd, sy); g.arc(sx, sy, hd, 0, 6.2832); } else g.rect(sx - hd, sy - hd, ds, ds);
        }
        g.fill();
      }
    }
    // the network, drawn in as the camera pulls back
    const u = smoothstep(p, 0.8, 1);
    if (u > 0) {
      g.lineWidth = 1; g.strokeStyle = 'rgba(150,182,245,.3)';
      for (const A of NET) {
        const pr = clamp((u - A.d) / 0.5, 0, 1);
        if (pr <= 0) continue;
        const n = Math.max(1, Math.round(pr * 28));
        g.beginPath(); g.moveTo(X(A.pts[0]), Y(A.pts[1]));
        for (let i = 1; i <= n; i++) g.lineTo(X(A.pts[i * 2]), Y(A.pts[i * 2 + 1]));
        g.stroke();
        g.fillStyle = 'rgba(200,216,250,.85)';
        g.beginPath(); g.arc(X(A.pts[0]), Y(A.pts[1]), 1.6, 0, 6.2832); g.fill();
        if (pr > 0.98) { g.beginPath(); g.arc(X(A.pts[56]), Y(A.pts[57]), 1.6, 0, 6.2832); g.fill(); }
      }
    }
    // the route: ahead dashed, behind glowing
    const cut = Math.floor(C.s * (RPTS.length - 1));
    g.lineCap = 'round'; g.lineJoin = 'round';
    if (C.s < 1) {
      const aA = 0.4 * (1 - C.t * 0.5);
      if (textR) { const lg = g.createLinearGradient(textR - 80, 0, textR + 100, 0); lg.addColorStop(0, `rgba(252,182,46,${(aA * 0.12).toFixed(3)})`); lg.addColorStop(1, `rgba(252,182,46,${aA.toFixed(3)})`); g.strokeStyle = lg; }
      else g.strokeStyle = `rgba(252,182,46,${aA.toFixed(3)})`;
      g.setLineDash([2, 7]); g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(X(C.v.x), Y(C.v.y));
      for (let i = cut + 1; i < RPTS.length; i++) g.lineTo(X(RPTS[i][0]), Y(RPTS[i][1]));
      g.stroke(); g.setLineDash([]);
    }
    if (C.s > 0.001) {
      g.beginPath(); g.moveTo(X(RPTS[0][0]), Y(RPTS[0][1]));
      for (let i = 1; i <= cut; i++) g.lineTo(X(RPTS[i][0]), Y(RPTS[i][1]));
      g.lineTo(X(C.v.x), Y(C.v.y));
      g.strokeStyle = 'rgba(252,182,46,.16)'; g.lineWidth = 8; g.stroke();
      g.strokeStyle = '#FCB62E'; g.lineWidth = 2.2; g.stroke();
    }
    // cities
    const names = D().cities;
    g.font = `500 ${portrait ? 9.5 : 10.5}px ${MONO}`;
    if ('letterSpacing' in g) g.letterSpacing = '1px';
    g.textBaseline = 'middle';
    for (const c of CITIES) {
      const sx = X(c.x), sy = Y(c.y);
      if (sx < -60 || sx > W + 60 || sy < -30 || sy > H + 30) continue;
      const end = c.k === 'buc' || c.k === 'par';
      const a = (end ? 1 : 1 - C.t) * calm(sx);
      if (a < 0.03) continue;
      const passed = C.s >= c.s - 0.002;
      g.globalAlpha = a;
      g.beginPath(); g.arc(sx, sy, end ? 4 : 3, 0, 6.2832);
      if (passed) { g.fillStyle = '#FCB62E'; g.fill(); }
      else { g.fillStyle = '#0B1A3A'; g.fill(); g.strokeStyle = 'rgba(190,205,238,.8)'; g.lineWidth = 1.3; g.stroke(); }
      g.fillStyle = passed ? 'rgba(236,241,252,.95)' : 'rgba(190,205,238,.8)';
      const label = names[c.k];
      if (c.k === 'par') { g.textAlign = 'right'; g.fillText(label, sx - 12, sy - 1); }
      else if (c.k === 'buc') { g.textAlign = 'center'; g.fillText(label, sx, sy + 24); }
      else { g.textAlign = 'center'; g.fillText(label, sx, sy - 15); }
      g.globalAlpha = 1;
    }
    g.textAlign = 'left';
    if ('letterSpacing' in g) g.letterSpacing = '0px';
    // the vehicle: the yellow CGA arrow, pointing where it goes
    const L = portrait ? 10 : 12.5;
    const halo = g.createRadialGradient(vx, vy, 0, vx, vy, L * 2.6);
    halo.addColorStop(0, 'rgba(252,182,46,.4)'); halo.addColorStop(1, 'rgba(252,182,46,0)');
    g.fillStyle = halo; g.fillRect(vx - L * 3, vy - L * 3, L * 6, L * 6);
    const ang = C.s >= 1 ? routeAt(0.995).ang : C.v.ang;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    const P = (fx, fy) => [vx + fx * ca - fy * sa, vy + fx * sa + fy * ca];
    const [ax1, ay1] = P(L, 0), [ax2, ay2] = P(-L * 0.62, -L * 0.66), [ax3, ay3] = P(-L * 0.62, L * 0.66);
    g.beginPath(); g.moveTo(ax1, ay1); g.lineTo(ax2, ay2); g.lineTo(ax3, ay3); g.closePath();
    g.lineWidth = 3.4; g.strokeStyle = '#0A1732'; g.stroke();
    g.fillStyle = '#FCB62E'; g.fill();
    g.lineWidth = 1.6; g.strokeStyle = '#FCB62E'; g.stroke();
    return C;
  }

  function drawLive(g, p, now, C) {
    const X = x => C.ax + (x - C.cx) * C.z, Y = y => C.ay + (y - C.cy) * C.z;
    const vx = X(C.v.x), vy = Y(C.v.y);
    const ring = now ? (now * 0.00045) % 1 : 0.3;
    g.lineWidth = 1.5;
    g.strokeStyle = `rgba(252,182,46,${((1 - ring) * 0.6).toFixed(3)})`;
    g.beginPath(); g.arc(vx, vy, 12 + ring * 26, 0, 6.2832); g.stroke();
    // the pin drop on Bucharest at first paint
    if (loadK < 1 && p < 0.1) {
      const k = loadK, bx = X(CITIES[0].x), by = Y(CITIES[0].y);
      g.strokeStyle = `rgba(252,182,46,${(0.8 * (1 - k)).toFixed(3)})`; g.lineWidth = 2;
      g.beginPath(); g.arc(bx, by, 6 + k * 60, 0, 6.2832); g.stroke();
    }
    // packets travelling the network at rest
    const u = smoothstep(p, 0.9, 1);
    if (u > 0.01) {
      for (const A of NET) {
        const ph = now ? (((now / A.per) + A.off) % 1) : A.off;
        const t = A.dir > 0 ? ph : 1 - ph;
        const f = t * 28, i = Math.min(27, Math.floor(f)), r = f - i;
        const x = X(lerp(A.pts[i * 2], A.pts[i * 2 + 2], r)), y = Y(lerp(A.pts[i * 2 + 1], A.pts[i * 2 + 3], r));
        const a = u * Math.sin(Math.PI * t);
        g.fillStyle = `rgba(252,196,90,${(0.22 * a).toFixed(3)})`; g.beginPath(); g.arc(x, y, 5, 0, 6.2832); g.fill();
        g.fillStyle = `rgba(255,226,160,${(0.95 * a).toFixed(3)})`; g.beginPath(); g.arc(x, y, 1.7, 0, 6.2832); g.fill();
      }
    }
  }

  function drawScene(p, now, idle) {
    if (!ctx || !W) return;
    if (idle) {
      const key = `${p.toFixed(5)}|${lang}|${W}x${H}`;
      if (key !== baseKey) { octx.clearRect(0, 0, W, H); lastC = drawBase(octx, p, obgGrad); baseKey = key; }
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(off, 0, 0); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      drawLive(ctx, p, now, lastC);
    } else {
      baseKey = '';
      const C = drawBase(ctx, p, bgGrad);
      drawLive(ctx, p, now, C);
    }
  }
  let lastC = null;

  /* caption bands, paced in scroll distance */
  const bands = $$('.band').map(el => ({
    el, a: +el.dataset.a, b: +el.dataset.b, ramp: +(el.dataset.ramp || 0),
    first: el.dataset.a === '0', last: el.dataset.b === '1', op: -1, k: -1, on: null
  }));
  let loadK = 0, loadStart = 0;
  let staticMode = MQLS.some(m => m.matches);

  function updateCaptions(p) {
    for (const B of bands) {
      const { a, b } = B;
      const f = Math.min(0.04, (b - a) / 3);
      let op = (B.first ? 1 : smoothstep(p, a, a + f)) * (B.last ? 1 : 1 - smoothstep(p, b - f, b));
      let k = clamp((p - a) / (B.ramp || Math.min(0.045, (b - a) * 0.35)), 0, 1);
      if (B.first) k = Math.max(k, loadK);
      if (staticMode) { op = B.last ? 1 : 0; k = 1; }
      if (Math.abs(op - B.op) > 0.004 || ((op === 0 || op === 1) && op !== B.op)) {
        B.op = op; B.el.style.opacity = op.toFixed(3);
        const on = op > 0.5;
        if (on !== B.on) { B.on = on; B.el.classList.toggle('on', on); }
      }
      if (Math.abs(k - B.k) >= 0.008 || ((k === 0 || k === 1) && k !== B.k)) { B.k = k; B.el.style.setProperty('--k', k.toFixed(3)); }
    }
  }

  const hud = $('.hud'), hudL = $('.hud-l'), hudN = $('.hud-n'), cue = $('.cue');
  let hudKey = '', hudAt = 0, cueOp = -1;
  function updateHud(p, now) {
    const c = 1 - smoothstep(p, 0, 0.035);
    if (Math.abs(c - cueOp) > 0.01 || (c === 0 && cueOp !== 0)) { cueOp = c; cue.style.opacity = c.toFixed(2); }
    if (hudKey && now - hudAt < 100) return;
    const s = sOf(p), on = s >= 1;
    const km = Math.round(ROUTE_KM * s);
    const key = (on ? 'on' : String(km)) + lang;
    if (key === hudKey) return;
    hudKey = key; hudAt = now;
    hudL.textContent = on ? D().done : 'BUC → PAR';
    hudN.textContent = on ? `${fmt(ROUTE_KM)} km ✓` : `${fmt(km)} km`;
    hud.classList.toggle('on', on);
  }

  const heroProgress = () => {
    const range = hero.offsetHeight - innerHeight;
    return range > 0 ? clamp(-hero.getBoundingClientRect().top / range, 0, 1) : 1;
  };

  /* the drive loop: eased toward the scroll target, frame-rate independent, and it stops off-screen */
  let target = 0, shown = 0, rafId = null, lastTick = 0, lastDraw = 0, heroOn = true;
  function frame(now) {
    rafId = null;
    const dt = Math.min(100, now - (lastTick || now));
    lastTick = now;
    shown += (target - shown) * (1 - Math.pow(1 - 0.13, dt / 16.667));
    const converged = Math.abs(target - shown) < 0.0004;
    if (converged) shown = target;
    if (loadK < 1) { const t = clamp((now - loadStart) / 1200, 0, 1); loadK = 1 - Math.pow(1 - t, 3); }
    const idle = converged && loadK >= 1;
    if (!idle || now - lastDraw > 33) { drawScene(shown, now, idle); lastDraw = now; }
    updateCaptions(shown);
    updateHud(shown, now);
    if (heroOn && !staticMode && !doc.hidden) rafId = requestAnimationFrame(frame);
    else lastTick = 0;
  }
  function kick() { if (rafId === null && heroOn && !staticMode && !doc.hidden) rafId = requestAnimationFrame(frame); }
  function stopLoop() { if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; } lastTick = 0; }
  function drawStatic() { loadK = 1; drawScene(1, 0, true); bands.forEach(B => { B.op = -1; B.k = -1; }); updateCaptions(1); updateHud(1, performance.now() + 1000); }

  function applyHeroMode() {
    staticMode = MQLS.some(m => m.matches);
    if (staticMode) { stopLoop(); drawStatic(); pinFinal(); }
    else {
      unpinFinal();
      bands.forEach(B => { B.op = -1; B.k = -1; });
      target = shown = heroProgress();
      hudKey = '';
      updateCaptions(shown);
      kick();
    }
  }

  /* ---------------- the night map behind the contact ---------------- */
  const nightSec = $('#contact'), nightCv = $('#night-map');
  let nctx = null, nightSeen = false;
  try { nctx = nightCv.getContext('2d'); } catch (e) { nctx = null; }
  function drawNight() {
    if (!nctx || !nightSeen) return;
    const w = nightSec.clientWidth, h = nightSec.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    nightCv.width = Math.round(w * dpr); nightCv.height = Math.round(h * dpr);
    const g = nctx; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
    const narrow = w < 900;
    const rx0 = narrow ? w * 0.05 : w * 0.34, rx1 = narrow ? w * 0.95 : w * 1.02, ry0 = h * 0.06, ry1 = h * 0.98;
    const z = Math.min((rx1 - rx0) / (OVER.x1 - OVER.x0), (ry1 - ry0) / (OVER.y1 - OVER.y0));
    const ax = (rx0 + rx1) / 2, ay = (ry0 + ry1) / 2, wcx = (OVER.x0 + OVER.x1) / 2, wcy = (OVER.y0 + OVER.y1) / 2;
    const X = x => ax + (x - wcx) * z, Y = y => ay + (y - wcy) * z;
    const ds = clamp(z * MAP.STEP * 0.2, 0.9, 2.2);
    g.fillStyle = 'rgba(128,156,214,.2)'; g.beginPath();
    for (let i = 0; i < NDOT; i++) { const x = X(DOTX[i]), y = Y(DOTY[i]); if (x < -4 || x > w + 4 || y < -4 || y > h + 4) continue; g.rect(x - ds / 2, y - ds / 2, ds, ds); }
    g.fill();
    g.strokeStyle = 'rgba(150,182,245,.16)'; g.lineWidth = 1;
    for (const A of NET) { g.beginPath(); g.moveTo(X(A.pts[0]), Y(A.pts[1])); for (let i = 1; i <= 28; i++) g.lineTo(X(A.pts[i * 2]), Y(A.pts[i * 2 + 1])); g.stroke(); }
    g.strokeStyle = 'rgba(252,182,46,.5)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(X(RPTS[0][0]), Y(RPTS[0][1]));
    for (let i = 1; i < RPTS.length; i++) g.lineTo(X(RPTS[i][0]), Y(RPTS[i][1]));
    g.stroke();
    const bx = X(CITIES[0].x), by = Y(CITIES[0].y);
    g.fillStyle = '#FCB62E'; g.beginPath(); g.arc(bx, by, 3.5, 0, 6.2832); g.fill();
    const shade = g.createLinearGradient(0, 0, narrow ? 0 : w, narrow ? h : 0);
    shade.addColorStop(0, 'rgba(10,23,50,.94)'); shade.addColorStop(narrow ? 0.55 : 0.45, 'rgba(10,23,50,.55)'); shade.addColorStop(1, 'rgba(10,23,50,.2)');
    g.fillStyle = shade; g.fillRect(0, 0, w, h);
  }

  /* ---------------- nav theme ---------------- */
  const nav = $('.nav');
  let navDark = null;
  function updateNav() {
    const nh = nav.offsetHeight;
    const dark = hero.getBoundingClientRect().bottom > nh + 30 || nightSec.getBoundingClientRect().top < nh * 0.5;
    if (dark !== navDark) { navDark = dark; nav.classList.toggle('dark', dark); }
  }

  /* ---------------- the road in "how it works" ---------------- */
  const steps = $('.route-steps'), stopEls = $$('.stops li');
  let stopPos = [], rpShown = -1;
  function layoutRoad() {
    const r = steps.getBoundingClientRect();
    stopPos = stopEls.map(li => {
      const m = $('.stop-mark', li).getBoundingClientRect();
      return NARROW.matches ? (m.top + m.height / 2 - r.top) / r.height : (m.left + m.width / 2 - r.left) / r.width;
    });
    rpShown = -1; updateRoad();
  }
  function updateRoad() {
    let rp;
    if (RM.matches) rp = 1;
    else {
      const r = steps.getBoundingClientRect(), vh = innerHeight;
      rp = NARROW.matches ? clamp((vh * 0.62 - r.top) / r.height, 0, 1) : clamp((vh * 0.82 - r.top) / (vh * 0.5), 0, 1);
    }
    if (Math.abs(rp - rpShown) < 0.002 && rpShown >= 0) return;
    rpShown = rp;
    steps.style.setProperty('--rp', rp.toFixed(4));
    stopEls.forEach((li, i) => { const on = rp >= (stopPos[i] || 0) - 0.005; if (li.classList.contains('on') !== on) li.classList.toggle('on', on); });
  }

  let scrollQueued = false;
  function onScroll() {
    if (!staticMode) { target = heroProgress(); kick(); }
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(() => { scrollQueued = false; updateNav(); updateRoad(); }); }
  }

  /* ---------------- entrances and living elements ---------------- */
  const reveal = new IntersectionObserver(entries => {
    let n = 0;
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.style.setProperty('--i', n++);
      el.classList.add('in');
      reveal.unobserve(el);
      if (el.classList.contains('num')) runCounter(el);
      setTimeout(() => el.classList.add('done'), 2400 + n * 120);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  $$('.rv').forEach(el => reveal.observe(el));

  const live = new IntersectionObserver(entries => entries.forEach(e => e.target.classList.toggle('live', e.isIntersecting)));
  $$('.sec').forEach(s => live.observe(s));

  new IntersectionObserver(entries => entries.forEach(e => {
    heroOn = e.isIntersecting;
    if (heroOn) kick(); else stopLoop();
  })).observe(hero);

  new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting && !nightSeen) { nightSeen = true; drawNight(); }
  }), { rootMargin: '300px 0px' }).observe(nightSec);

  doc.addEventListener('visibilitychange', () => {
    doc.body.classList.toggle('paused', doc.hidden);
    if (!doc.hidden) kick();
  });

  /* ---------------- counters ---------------- */
  const nums = $$('.num .n').map(el => ({ el, to: +el.dataset.count, dec: +(el.dataset.dec || 0), suf: el.dataset.suffix || '', v: null, txt: '' }));
  function numText(N, v) {
    let s = fmt(v, N.dec);
    if (N.suf === '%') s += lang === 'de' ? ' %' : '%';
    else s += N.suf;
    return s;
  }
  function writeNum(N, v) { const t = numText(N, v); if (t !== N.txt) { N.txt = t; N.el.textContent = t; } }
  function renderCounters() { nums.forEach(N => writeNum(N, N.v == null ? N.to : N.v)); }
  function runCounter(li) {
    const N = nums.find(x => li.contains(x.el));
    if (!N || RM.matches) return;
    const t0 = performance.now(), dur = 1700;
    const step = now => {
      const t = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - t, 4);
      N.v = t < 1 ? (N.dec ? Math.round(N.to * e * 10) / 10 : Math.round(N.to * e)) : null;
      writeNum(N, N.v == null ? N.to : N.v);
      if (t < 1) requestAnimationFrame(step);
    };
    N.v = 0; writeNum(N, 0);
    requestAnimationFrame(step);
  }

  /* ---------------- the fleet picker: pick your van, it loads up and joins the fleet ---------------- */
  const SVGNS = 'http://www.w3.org/2000/svg';
  const truck = $('#truck'), plRes = $('#pl-result');
  const plKind = $('#pl-kind'), plDesc = $('#pl-desc'), plSpec = $('#pl-spec');
  const vanBtns = $$('.seg-5 button');
  // the vans CGA takes into its fleet: pallets, pallet columns and rows in the cargo box, cab length
  const VANS = { 2: { cols: 2, rows: 1, cabW: 48 }, 5: { cols: 3, tarp: false }, 6: { cols: 3, tarp: false }, 7: { cols: 4, tarp: false }, 8: { cols: 4, tarp: true } };
  let van = 5, vanShown = 0, vehicles = {};
  const svgEl = (tag, attrs, parent) => { const e = doc.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  function buildVan(n) {
    const { cols, tarp = false, rows = 2, cabW = 58 } = VANS[n];
    const sw = 40, sh = 26, gp = 5;
    const cw = cols * sw + (cols + 1) * gp, ch = rows * sh + (rows + 1) * gp;
    const x0 = 350 - (cw + 4 + cabW) / 2, y0 = 75 - ch / 2, cx = x0 + cw + 4;
    const g = svgEl('g', { class: 'veh' }, truck);
    [x0 + 22, cx + cabW - 34].forEach(wx => [y0 - 4, y0 + ch - 3].forEach(y => svgEl('rect', { class: 'wheel', x: wx, y, width: 24, height: 7, rx: 2 }, g)));
    svgEl('rect', { class: 'body' + (tarp ? ' tarp' : ''), x: x0, y: y0, width: cw, height: ch, rx: tarp ? 5 : 8 }, g);
    // pallets load from the cab backwards; an odd count leaves one place free at the doors
    let i = 0;
    for (let c = cols - 1; c >= 0; c--) {
      for (let r = 0; r < rows; r++) {
        const on = i < n;
        const s = svgEl('rect', { class: on ? 'slot on' : 'slot', x: x0 + gp + c * (sw + gp), y: y0 + gp + r * (sh + gp), width: sw, height: sh, rx: 3 }, g);
        if (on) s.style.setProperty('--d', i);
        i++;
      }
    }
    if (tarp) for (let c = 1; c < cols; c++) { const x = x0 + c * (sw + gp) + gp / 2; svgEl('line', { class: 'strap', x1: x, y1: y0 - 1, x2: x, y2: y0 + ch + 1 }, g); }
    svgEl('rect', { class: 'mirror', x: cx + cabW - 28, y: y0 - 7, width: 6, height: 9, rx: 2 }, g);
    svgEl('rect', { class: 'mirror', x: cx + cabW - 28, y: y0 + ch - 2, width: 6, height: 9, rx: 2 }, g);
    svgEl('rect', { class: 'cab', x: cx, y: y0, width: cabW, height: ch, rx: rows > 1 ? 12 : 9 }, g);
    svgEl('rect', { class: 'glass', x: cx + cabW - 16, y: y0 + 7, width: 8, height: ch - 14, rx: 3 }, g);
    const mx = cx + cabW * 0.4, my = 75, a = rows > 1 ? 1 : 0.62;
    svgEl('path', { class: 'mk', d: `M${mx - 7 * a} ${my - 10 * a}L${mx + 10 * a} ${my}L${mx - 7 * a} ${my + 10 * a}Z` }, g);
    return { g };
  }
  function buildFleet() { truck.textContent = ''; for (const n in VANS) vehicles[n] = buildVan(+n); }
  function renderFleet(animate) {
    for (const k in vehicles) vehicles[k].g.classList.toggle('cur', +k === van);
    const t = D().vans[van];
    plKind.textContent = t[0]; plSpec.textContent = t[1]; plDesc.textContent = D().vanDesc;
    if (animate && van !== vanShown) { plRes.classList.remove('swap'); void plRes.offsetWidth; plRes.classList.add('swap'); }
    vanShown = van;
  }
  vanBtns.forEach((b, i) => {
    b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1;
    b.addEventListener('click', () => {
      vanBtns.forEach(x => { const on = x === b; x.setAttribute('aria-checked', String(on)); x.tabIndex = on ? 0 : -1; });
      van = +b.dataset.van;
      renderFleet(true);
    });
    b.addEventListener('keydown', e => {
      const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const nb = vanBtns[(i + dir + vanBtns.length) % vanBtns.length];
      nb.click(); nb.focus();
    });
  });

  /* ---------------- FAQ ---------------- */
  $$('.qa').forEach(qa => {
    const btn = $('.q', qa), a = $('.a', qa);
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      a.hidden = !open;
      qa.classList.toggle('open', open);
    });
  });

  /* ---------------- reduced motion, live in both directions ---------------- */
  function pinFinal() { loadK = 1; rpShown = -1; updateRoad(); nums.forEach(N => { N.v = null; }); renderCounters(); }
  function unpinFinal() { rpShown = -1; updateRoad(); }

  /* ---------------- boot ---------------- */
  snapshotRO();
  buildFleet();
  const params = new URLSearchParams(location.search);
  const saved = store.get('cga-lang');
  const pickBrowser = () => {
    const langs = navigator.languages || [navigator.language || ''];
    if (langs.some(x => /^ro\b/i.test(x || ''))) return 'ro';
    for (const x of langs) { if (/^de\b/i.test(x)) return 'de'; if (/^en\b/i.test(x)) return 'en'; }
    return 'ro';
  };
  $$('.lang button').forEach(b => b.addEventListener('click', () => applyLang(b.dataset.lang, true)));

  buildScene();
  const first = DICT[params.get('lang')] ? params.get('lang') : DICT[saved] ? saved : pickBrowser();
  applyLang(first, false);
  loadStart = performance.now();
  if (staticMode) { drawStatic(); pinFinal(); }
  else { target = shown = heroProgress(); if (shown > 0.01) loadK = 1; kick(); }

  addEventListener('scroll', onScroll, { passive: true });
  updateNav();
  MQLS.forEach(m => onMQ(m, applyHeroMode));
  onMQ(NARROW, layoutRoad);

  let lastW = stage.clientWidth, lastH = stage.clientHeight, roadTimer = 0;
  new ResizeObserver(() => {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (w !== lastW || Math.abs(h - lastH) > 120) {
      lastW = w; lastH = h;
      buildScene();
      if (staticMode) drawStatic(); else { hudKey = ''; drawScene(shown, performance.now(), false); kick(); }
    }
  }).observe(stage);
  new ResizeObserver(() => { clearTimeout(roadTimer); roadTimer = setTimeout(() => { layoutRoad(); drawNight(); }, 140); }).observe(doc.body);
  if (doc.fonts && doc.fonts.load) doc.fonts.load(`500 10px ${MONO}`).then(() => { baseKey = ''; if (staticMode) drawStatic(); else { drawScene(shown, performance.now(), false); kick(); } layoutRoad(); }).catch(() => {});
  layoutRoad();
})();
