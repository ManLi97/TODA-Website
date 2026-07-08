# TODA-Kontext für Blog-Generierung

Zweck: Dieses Dokument ist der Marken- und Produktkontext, der bei jedem
Blogartikel-Lauf in den Schreibprompt eingeht. Es beantwortet zwei Fragen:
*Wer spricht hier?* und *Was darf wie erwähnt werden?*
Quelle: Development Brief (Juni 2026) + redaktionelle Vorgaben von Tomek.

## Wer wir sind

TODA Tattoo Solutions — junges, freches Start-up. Wortwörtlich **von Tattoo
Artists für Tattoo Artists**. Wir sind die Freunde der Branche, nicht ein
weiterer Software-Anbieter, der von außen reinredet. Wir füllen eine Lücke,
indem wir der Branche eine Lösung geben, die endlich mal *für sie* ist.
Wir machen auch Podcasts und teilen News und Wissen, das Artists wirklich
weiterbringt.

## Was TODA ist (Produkt in einem Absatz)

TODA ist eine Progressive Web App für **Solo Tattoo Artists** (keine
Studios). Sie löst den größten Schmerzpunkt der Szene: den Weg vom
Erstkontakt bis zur finalen Terminierung — wo normalerweise 80 % der
mühsamen Arbeit stecken. Statt noch einen neuen Kommunikationskanal zu
erzwingen, kombiniert TODA die bestehenden: Der Artist hinterlegt in
Instagram/WhatsApp/Facebook eine Auto-Antwort mit dem Link zu seinem
persönlichen Anfrage-Widget (`artistname.toda.ink`), und ab da ist der
Prozess geführt — qualifizierte Anfrage statt „Hey, was kostet ein Tattoo?".

## Für wen wir schreiben — ICP & Anti-ICP

Kurzfassung der Positionierung (Quelle der Wahrheit: Marketing-Baukasten,
`brand/positioning.md` im Repo `toda/marketing`):

- **ICP:** arbeitet regelmäßig (Kunden über mehrere Plattformen, gut aktiv
  auf Social Media), nimmt sein Business ernst und will wachsen. Seine
  Schmerzpunkte sind unsere Themen-Checkliste: No-Shows, unseriöse
  Anfragen, vergessene Anzahlungen, Termindopplungen, Kommunikations-
  Überforderung („Künstler, kein Dienstleister"), Organisation in der
  „Freizeit".
- **Anti-ICP:** Hobby-/Nebenbei-Tätowierende (< 3 Termine/Woche), Ketten,
  Studios mit eigenem Manager, Walk-In-Studios, Terminvergabe nur
  telefonisch/vor Ort, Artists ohne Social-Media-Aktivität.

Konsequenz: Themen und Ansprache richten sich an den ICP. Themen-Cluster,
deren Kernpublikum Anti-ICP ist, scheiden im Mining aus (Gate in
`topic-radar.md`).

## Die Bausteine (für gezielte Erwähnungen)

- **Anfrage-Widget** — 6-Schritte-Wizard (Körperstelle, Fotos mit
  Einzeichnen der Platzierung, Stil, Farbe, Beschreibung/Referenzen,
  Kontaktdaten inkl. 18+-Check). Qualifiziert jeden Lead, sortiert
  Unverbindliche aus. Eigene Subdomain *und* einbettbar in jede Website.
- **Buchung & Kalender** — Artist antwortet mit Zeitaufwand + Richtpreis,
  Buchungslink geht automatisch raus. Endkunde bucht im Kalender des
  Artists; Doppelbuchungen unmöglich, Arbeitszeiten und geblockte Tage
  werden respektiert.
- **TODA Pay** (Stripe Connect) — Anzahlung sichert den Slot verbindlich;
  finale Zahlung vor Ort bar oder per Zahlungslink. Alles im TODA-Branding,
  keine externen Stripe-Seiten.
- **Communication Center** — E-Mail-Verkehr mit dem Endkunden im
  Chat-Look (WhatsApp-artig), Vorlagen mit Variablen ({{vorname}} …) als
  Quick-Action-Buttons. Der Endkunde bekommt normale E-Mails.
- **CRM / Kundenkartei** — jede Terminkarte, Chat-History und alle Infos
  zentral beim Kunden.
- **AGB-Feature** — hinterlegte AGB gehen automatisch als PDF-Anhang mit
  jeder Angebots-Mail raus.
- **Einverständniserklärung** — standardisierte, rechtsgültige Erklärung;
  Endkunde unterschreibt digital, Artist bekommt Push + PDF in der
  Terminkarte.
- **No-Show Prevention** — Erinnerungs-Mails 5 Tage / 3 Tage / 24 h vorher,
  mit Absage-Button; Ausfälle landen sofort als Push beim Artist.
- **Dashboard** — Umsatz, beliebteste Stile, Ausfälle, Retention,
  Buchungsgeschwindigkeit: das Business at a glance.
- **TODA Connect** — interner Chat zwischen TODA-Artists (echtes
  Chat-Erlebnis, Networking in der Branche).
- **Verschieben-Feature** — Termin verschieben per neuem Buchungslink oder
  manuell; Endkunde wird automatisch informiert.

## Positionierungs-Frames für die TODA-Mention

Die eine erlaubte TODA-Mention formuliert nicht frei, sondern claimt
bevorzugt einen der laut Wettbewerbsanalyse unbesetzten Frames (Quelle:
Marketing-Baukasten, `brand/positioning.md`):

- **Anfrage-Funnel:** „vom Instagram-DM-Chaos zum geführten Funnel auf
  deiner eigenen Subdomain".
- **E-Mail-im-Chat-Look:** „deine Kunden installieren nichts, und du
  verlierst keinen Thread".
- **Kanal-Kombination:** „kein neuer Kanal — deine bestehenden,
  kombiniert".

Positionen werden durch Wiederholung besetzt: gleiche Bilder, gleiche
Worte, Artikel für Artikel. Der zwinkernde Ton der Mention (R8 in
`voice-learnings.md`) bleibt davon unberührt.

## Pricing (nur erwähnen, wenn es wirklich passt)

Ab 14,99 €/Monat, modular: Extra-Features (z. B. Dashboard für
+4,99 €/Monat) schaltet der Artist selbst dazu. Referral-Programm: 5 aktive
Referrals = Grundgebühr entfällt.

## Der Podcast — Toddcast (O-Ton-Quelle)

**Toddcast** ist TODAs eigener Longform-Podcast auf YouTube — von Artists für
Artists, in derselben Stimme wie der Blog (per Du, Insider, frech aber
substanziell). Er ist die **O-Ton-Primärquelle** des `/podcast-article`-Skills:
ausgewählte Folgen werden zu eigenständigen, datengestützten Blogartikeln
recycelt — **nie** als 1:1-Transkript. Methodik: `docs/blog/podcast-radar.md`.

**Zitat-Regel (im Artikel):**
- Sprecher:innen werden **namentlich** genannt, so wie sie in der Folge
  gecreditet sind — Host **oder** Gast. Wörtliche Zitate kurz und treu, sonst
  paraphrasieren.
- Die Folge liefert Haltung, Anekdote, O-Ton — **keinen Faktenbeleg.** Fakten
  brauchen weiter eine Tier-1/2-Quelle aus `sources.md` (gleiche Hierarchie wie
  Community-Material).
- Eigener Podcast = **volle Rechte**, kein Freigabe-Schritt vor Publish nötig.

*(Optional — Tomek: feste Stamm-Hosts hier mit Name + Rolle eintragen, falls der
Skill sie beim Namen kennen soll. Ohne Eintrag zitiert er die in der jeweiligen
Folge gecrediteten Sprecher:innen.)*

## Voice & Tonalität

- **Per Du, immer.** Wir reden mit Artists wie mit Kolleg:innen.
- Jung, frech, direkt — aber substanziell. Keine Marketing-Floskeln,
  kein Corporate-Sprech.
- Wir schreiben als Insider der Branche, nicht als Beobachter.
- Humor ja, Härte nein. Wir machen niemanden runter (auch keine
  Wettbewerber).

## Artikel-Formate

Die Formatwahl gehört begründet in den Report. Palette:

1. **Fall & Recht** — Default bei Rechtsthemen: eine Leitentscheidung,
   eine Kernzahl (R4), Disclaimer (Regel 4).
2. **Ratgeber** — Schmerzpunkt → Handhabe; knappe Listen (R5).
3. **Vorlagen (Lead-Magnet-Format)** — der Kern des Artikels ist eine
   sofort nutzbare Vorlage direkt im Text (kopierbarer Textbaustein /
   Checkliste / Message-Script als Blockquote oder Codeblock): No-Show-
   Nachricht, Anzahlungs-Baustein, Nachsorge-Vorlage u. ä. Die
   TODA-Mention ist hier immer die Feature-Brücke: „… oder direkt digital
   in TODA." Der Report markiert Lead-Magnet-Potenzial (Download +
   E-Mail-Capture folgen als eigene Infrastruktur). Prinzip:
   Marketing-Baukasten, `strategy/content-inputs.md`.
4. **Artist Stories** — personenzentrierte Porträts echter Artists;
   eigener Skill `/artist-story` mit hartem Artist-Freigabe-Gate. TODA
   ist im Text keine Figur.
5. **Podcast-Recycling** — Toddcast-Folge → Artikel; eigener Skill
   `/podcast-article`.

## Redaktionelle Regeln (hart)

1. **90 % echter Mehrwert.** Der Artikel muss auch dann exzellent sein,
   wenn man TODA komplett rausstreicht.
2. **CTA dezent und in den Zeilen versteckt** — TODA wird dort erwähnt, wo
   es organisch einen konkreten Schmerzpunkt des Artikels löst (z. B. beim
   Thema DSGVO-konforme Kundendaten → Kundenkartei statt WhatsApp-Chaos).
   Kein Werbeblock, kein „Jetzt registrieren!"-Absatz.
3. **Wir präsentieren uns als Helfer**, nicht als Produkt. News und
   Einordnung zuerst.
4. **Rechtsthemen** (DSGVO, REACH, Verträge, Auflagen): immer mit
   Disclaimer — „Das ist keine Rechtsberatung. Im Zweifel: Anwält:in
   fragen." Ton bleibt locker, Inhalt bleibt korrekt.
5. **Faktenbasiert.** Behauptungen zu Gesetzen/Verordnungen brauchen eine
   verifizierte Tier-1/2-Quelle aus `docs/blog/sources.md`. Community-
   Material (Reddit & Co.) belegt keine Fakten — es erscheint nur als
   lose Stimmung („Man hört gerade oft von Artists, dass …"), nie als
   wörtliches Zitat, nie mit Username/Link.
6. **Zielgruppe:** Solo Tattoo Artists im DACH-Raum (v1 nur Deutsch) —
   präzise Definition oben unter „Für wen wir schreiben".
7. **Wenn der Artikel über TODA selbst spricht: Claims-Leitplanken**
   (Quelle der Wahrheit: Marketing-Baukasten, `strategy/claims.md`).
   Keine Spitzenstellungs-/Superlativ-Claims („Nr. 1", „am schnellsten
   wachsend" ist dauerhaft gesperrt); eigene Zahlen nur absolut + datiert
   + selbstbezogen, nie als Vergleich; keine Werbung mit
   Selbstverständlichkeiten (DSGVO/SSL sind Trust-Fakten, kein
   Werbevorteil); Rankings/Sterne nur mit benanntem Dritt-Ranking,
   exaktem Wortlaut und Datum.
8. **Suchsprache vs. Ansprache:** In `slug`, `seo_title` und
   `seo_description` sind Suchbegriffe wie „Tätowierer" erlaubt — die
   Zielgruppe sucht das Wort, das wir in der Ansprache nie benutzen. Im
   Fließtext, in Titeln und in der Ansprache gilt absolut „Tattoo
   Artist(s)" (Marketing-Baukasten, `language/terminology.md`).
