-- Seed: 3 example blog posts (generic content), published in de/es/en.
-- Example content only — safe to edit or delete later via /admin.
-- Fixed UUIDs so re-running locally stays deterministic.

-- ── Categories ──────────────────────────────────────────────────────────────
insert into public.blog_categories (id, slug, name, sort_order) values
  ('11111111-1111-4111-8111-111111111101', 'studio-management',
   '{"de": "Studio-Management", "en": "Studio Management", "es": "Gestión del estudio"}', 1),
  ('11111111-1111-4111-8111-111111111102', 'marketing',
   '{"de": "Marketing", "en": "Marketing", "es": "Marketing"}', 2),
  ('11111111-1111-4111-8111-111111111103', 'business',
   '{"de": "Business & Finanzen", "en": "Business & Finance", "es": "Negocio y finanzas"}', 3);

-- ── Posts (hreflang shells) ──────────────────────────────────────────────────
insert into public.blog_posts (id, category_id) values
  ('22222222-2222-4222-8222-222222222201', '11111111-1111-4111-8111-111111111101'),
  ('22222222-2222-4222-8222-222222222202', '11111111-1111-4111-8111-111111111102'),
  ('22222222-2222-4222-8222-222222222203', '11111111-1111-4111-8111-111111111103');

-- ── Post 1 — Studio organization ─────────────────────────────────────────────
insert into public.blog_post_translations
  (post_id, locale, slug, title, excerpt, content_md, tags, status, published_at)
values
('22222222-2222-4222-8222-222222222201', 'de',
 'tattoo-studio-effizienter-organisieren',
 '5 Wege, dein Tattoo-Studio effizienter zu organisieren',
 'Weniger Verwaltung, mehr Zeit an der Maschine: fünf praktische Ansätze, mit denen du den Alltag in deinem Studio spürbar entlastest.',
 $md$Zwischen Terminen, Nachrichten und Vorzeichnungen bleibt im Studioalltag oft wenig Raum für das, was eigentlich zählt: das Tätowieren selbst. Die gute Nachricht — die meisten Reibungsverluste folgen wiederkehrenden Mustern und lassen sich systematisch beseitigen.

## 1. Bündle deine Kommunikation

Anfragen über Instagram, WhatsApp, E-Mail und Telefon gleichzeitig zu beantworten kostet Konzentration. Lege feste Zeitfenster fest, in denen du Nachrichten beantwortest, und leite alle Kanäle in einen einzigen Posteingang.

## 2. Standardisiere deine Abläufe

Was du mehr als zweimal machst, verdient eine Vorlage:

- Antworten auf häufige Anfragen
- Aufklärungs- und Einverständnisformulare
- Pflegehinweise nach der Session

> Ein dokumentierter Ablauf ist kein Bürokratie-Monster — er ist die Voraussetzung dafür, dass du delegieren kannst.

## 3. Plane Pufferzeiten ein

Sessions dauern selten exakt so lange wie geplant. Wer Termine ohne Puffer aneinanderreiht, gerät schon mittags in Rückstand und schleppt den Stress durch den ganzen Tag.

## 4. Digitalisiere deine Terminverwaltung

Ein Kalender, der Anzahlungen, Erinnerungen und Nachrichten an einem Ort zusammenführt, nimmt dir jede Woche Stunden ab — und reduziert Terminausfälle gleich mit.

## 5. Reflektiere regelmäßig

Nimm dir einmal im Monat 30 Minuten und frage dich: Was hat diesen Monat am meisten Zeit gekostet? Oft reicht eine kleine Änderung, um eine große Reibungsquelle dauerhaft zu beseitigen.

**Fazit:** Effizienz entsteht nicht durch mehr Disziplin, sondern durch bessere Strukturen. Fang mit dem Punkt an, der dich gerade am meisten Zeit kostet.$md$,
 '{Organisation, Workflow, Studio-Alltag}', 'published', now() - interval '14 days'),

('22222222-2222-4222-8222-222222222201', 'en',
 'run-your-tattoo-studio-more-efficiently',
 '5 Ways to Run Your Tattoo Studio More Efficiently',
 'Less admin, more time at the machine: five practical approaches that take real weight off your day-to-day studio routine.',
 $md$Between appointments, messages, and sketch prep, the studio day often leaves little room for what actually matters: tattooing. The good news — most friction follows recurring patterns and can be removed systematically.

## 1. Consolidate your communication

Answering requests across Instagram, WhatsApp, email, and phone at the same time drains your focus. Set fixed time windows for replying and funnel every channel into a single inbox.

## 2. Standardize your routines

Anything you do more than twice deserves a template:

- Replies to common requests
- Consent and disclosure forms
- Aftercare instructions

> A documented process is not bureaucracy — it is the precondition for being able to delegate.

## 3. Schedule buffer time

Sessions rarely take exactly as long as planned. If you stack appointments back to back, you are already behind by noon and carry that stress through the whole day.

## 4. Digitize your appointment management

A calendar that brings deposits, reminders, and messages together in one place saves you hours every week — and cuts down no-shows at the same time.

## 5. Review regularly

Once a month, take 30 minutes and ask yourself: what cost me the most time this month? Often a small change is enough to remove a major source of friction for good.

**Bottom line:** efficiency does not come from more discipline — it comes from better structures. Start with whatever costs you the most time right now.$md$,
 '{organization, workflow, studio life}', 'published', now() - interval '14 days'),

('22222222-2222-4222-8222-222222222201', 'es',
 'organizar-tu-estudio-de-tatuajes-con-eficiencia',
 '5 formas de organizar tu estudio de tatuajes con más eficiencia',
 'Menos administración, más tiempo con la máquina: cinco enfoques prácticos que aligeran de verdad el día a día de tu estudio.',
 $md$Entre citas, mensajes y preparación de diseños, el día a día del estudio deja poco espacio para lo que realmente importa: tatuar. La buena noticia: la mayoría de las fricciones siguen patrones recurrentes y se pueden eliminar de forma sistemática.

## 1. Unifica tu comunicación

Responder solicitudes por Instagram, WhatsApp, correo y teléfono a la vez agota tu concentración. Define franjas horarias fijas para responder y canaliza todos los mensajes hacia una sola bandeja de entrada.

## 2. Estandariza tus procesos

Todo lo que hagas más de dos veces merece una plantilla:

- Respuestas a solicitudes frecuentes
- Formularios de consentimiento
- Instrucciones de cuidado posterior

> Un proceso documentado no es burocracia: es la condición para poder delegar.

## 3. Planifica tiempos de margen

Las sesiones rara vez duran exactamente lo previsto. Si encadenas citas sin margen, al mediodía ya vas con retraso y arrastras ese estrés durante todo el día.

## 4. Digitaliza tu gestión de citas

Un calendario que reúne señas, recordatorios y mensajes en un solo lugar te ahorra horas cada semana — y reduce las ausencias de paso.

## 5. Reflexiona con regularidad

Una vez al mes, tómate 30 minutos y pregúntate: ¿qué me ha costado más tiempo este mes? A menudo basta un pequeño cambio para eliminar una gran fuente de fricción.

**Conclusión:** la eficiencia no nace de más disciplina, sino de mejores estructuras. Empieza por lo que más tiempo te cuesta ahora mismo.$md$,
 '{organización, flujo de trabajo, estudio}', 'published', now() - interval '14 days');

-- ── Post 2 — Social media ────────────────────────────────────────────────────
insert into public.blog_post_translations
  (post_id, locale, slug, title, excerpt, content_md, tags, status, published_at)
values
('22222222-2222-4222-8222-222222222202', 'de',
 'social-media-fuer-tattoo-artists',
 'Social Media für Tattoo Artists: Ein praktischer Leitfaden',
 'Du musst nicht täglich posten, um sichtbar zu sein. Ein realistischer Ansatz für Social Media, der neben dem Tätowieren funktioniert.',
 $md$Social Media ist für viele Artists das wichtigste Schaufenster — und gleichzeitig eine der größten Zeitfallen. Dieser Leitfaden zeigt einen Ansatz, der neben einem vollen Terminkalender realistisch durchzuhalten ist.

## Qualität schlägt Frequenz

Drei starke Posts pro Woche schlagen sieben mittelmäßige. Dein Portfolio ist dein Produkt: Gute Fotos von verheilten Arbeiten bauen mehr Vertrauen auf als jede Story.

## Plane in Batches

Statt jeden Tag spontan Content zu produzieren:

1. Fotografiere am Ende jeder Session konsequent dein Ergebnis
2. Sammle die Aufnahmen in einem zentralen Ordner
3. Plane einmal pro Woche alle Posts im Voraus

## Zeige den Prozess, nicht nur das Ergebnis

Vorzeichnungen, Stencil-Vorbereitung, dein Arbeitsplatz — Einblicke hinter die Kulissen machen dich nahbar und unterscheiden dich von reinen Portfolio-Accounts.

> Menschen buchen keine Motive. Sie buchen die Person, der sie ihre Haut anvertrauen.

## Antworte strukturiert auf Anfragen

Eine klare Anleitung in der Bio, welche Informationen du für eine Anfrage brauchst (Motiv, Größe, Körperstelle, Budget), spart dir Dutzende Rückfragen pro Woche.

**Fazit:** Behandle Social Media wie einen Teil deines Handwerks — mit System statt mit schlechtem Gewissen. Ein nachhaltiger Rhythmus, den du halten kannst, gewinnt langfristig immer.$md$,
 '{Social Media, Instagram, Sichtbarkeit}', 'published', now() - interval '7 days'),

('22222222-2222-4222-8222-222222222202', 'en',
 'social-media-for-tattoo-artists',
 'Social Media for Tattoo Artists: A Practical Guide',
 'You do not have to post daily to stay visible. A realistic social media approach that works alongside a full tattooing schedule.',
 $md$For many artists, social media is the most important shop window — and one of the biggest time sinks at once. This guide shows an approach you can realistically sustain next to a full booking calendar.

## Quality beats frequency

Three strong posts per week beat seven mediocre ones. Your portfolio is your product: good photos of healed work build more trust than any story.

## Plan in batches

Instead of producing content spontaneously every day:

1. Photograph your result consistently at the end of each session
2. Collect the shots in one central folder
3. Schedule all posts in advance once a week

## Show the process, not just the result

Sketches, stencil prep, your workspace — behind-the-scenes glimpses make you approachable and set you apart from pure portfolio accounts.

> People do not book designs. They book the person they trust with their skin.

## Answer requests with structure

A clear note in your bio listing what you need for a booking request (design, size, placement, budget) saves you dozens of follow-up questions every week.

**Bottom line:** treat social media as part of your craft — with a system instead of a guilty conscience. A sustainable rhythm you can actually keep wins in the long run, every time.$md$,
 '{social media, instagram, visibility}', 'published', now() - interval '7 days'),

('22222222-2222-4222-8222-222222222202', 'es',
 'redes-sociales-para-tatuadores',
 'Redes sociales para tatuadores: una guía práctica',
 'No necesitas publicar a diario para ser visible. Un enfoque realista de redes sociales compatible con una agenda llena.',
 $md$Para muchos tatuadores, las redes sociales son el escaparate más importante — y a la vez una de las mayores trampas de tiempo. Esta guía muestra un enfoque sostenible junto a una agenda llena.

## La calidad gana a la frecuencia

Tres publicaciones fuertes por semana ganan a siete mediocres. Tu portafolio es tu producto: buenas fotos de trabajos cicatrizados generan más confianza que cualquier historia.

## Planifica por lotes

En lugar de producir contenido espontáneamente cada día:

1. Fotografía tu resultado al final de cada sesión, sin excepción
2. Reúne las tomas en una carpeta central
3. Programa todas las publicaciones una vez por semana

## Muestra el proceso, no solo el resultado

Bocetos, preparación del stencil, tu espacio de trabajo — las miradas entre bastidores te hacen cercano y te diferencian de las cuentas que solo muestran portafolio.

> La gente no reserva diseños. Reserva a la persona a la que confía su piel.

## Responde a las solicitudes con estructura

Una nota clara en tu bio con lo que necesitas para una solicitud (diseño, tamaño, zona del cuerpo, presupuesto) te ahorra decenas de preguntas cada semana.

**Conclusión:** trata las redes sociales como parte de tu oficio — con sistema y sin mala conciencia. Un ritmo sostenible que puedas mantener siempre gana a largo plazo.$md$,
 '{redes sociales, instagram, visibilidad}', 'published', now() - interval '7 days');

-- ── Post 3 — No-shows ────────────────────────────────────────────────────────
insert into public.blog_post_translations
  (post_id, locale, slug, title, excerpt, content_md, tags, status, published_at)
values
('22222222-2222-4222-8222-222222222203', 'de',
 'terminausfaelle-reduzieren-umsatz-schuetzen',
 'Terminausfälle reduzieren: So schützt du deinen Umsatz',
 'Jeder geplatzte Termin ist verlorener Umsatz, der sich nicht nachholen lässt. Drei Hebel, mit denen du No-Shows deutlich senkst.',
 $md$Ein nicht erschienener Kunde kostet dich nicht nur das Honorar einer Session — auch die Vorbereitung, die Vorzeichnung und der blockierte Slot sind verloren. Dabei lassen sich die meisten Ausfälle mit wenigen strukturellen Maßnahmen vermeiden.

## Anzahlungen sind keine Unhöflichkeit

Die wirksamste einzelne Maßnahme gegen No-Shows ist eine verbindliche Anzahlung. Sie filtert unverbindliche Anfragen früh heraus und gibt beiden Seiten Planungssicherheit.

- Kommuniziere die Anzahlung transparent bei der Buchung
- Verrechne sie vollständig mit dem Endpreis
- Lege klare Regeln für Verschiebungen fest

## Erinnerungen zum richtigen Zeitpunkt

Viele Ausfälle sind schlicht vergessene Termine. Eine Erinnerung 48 Stunden vorher gibt Kunden genug Zeit, im Notfall zu verschieben — und dir genug Zeit, den Slot neu zu vergeben.

> Eine Verschiebung mit zwei Tagen Vorlauf ist kein Problem. Ein leerer Stuhl um 14 Uhr schon.

## Mach Verschieben einfacher als Verschwinden

Wenn Kunden für eine Terminänderung anrufen müssen und schlechtes Gewissen fürchten, tauchen manche lieber gar nicht erst auf. Ein einfacher, digitaler Weg zur Verschiebung senkt die Hemmschwelle — und rettet den Termin in deinen Kalender zurück.

**Fazit:** No-Shows sind kein Charakterproblem deiner Kundschaft, sondern ein Prozessproblem. Anzahlung, Erinnerung und ein einfacher Verschiebe-Weg lösen den größten Teil davon.$md$,
 '{No-Shows, Umsatz, Terminplanung}', 'published', now() - interval '2 days'),

('22222222-2222-4222-8222-222222222203', 'en',
 'reducing-no-shows-protect-your-revenue',
 'Reducing No-Shows: How to Protect Your Revenue',
 'Every missed appointment is revenue you cannot recover. Three levers that significantly cut down no-shows in your studio.',
 $md$A client who does not show up costs you more than the session fee — the preparation, the sketch, and the blocked slot are gone too. Yet most no-shows can be prevented with a few structural measures.

## Deposits are not impolite

The single most effective measure against no-shows is a binding deposit. It filters out non-committal requests early and gives both sides planning certainty.

- Communicate the deposit transparently at booking
- Credit it fully against the final price
- Set clear rules for rescheduling

## Reminders at the right moment

Many no-shows are simply forgotten appointments. A reminder 48 hours ahead gives clients enough time to reschedule if needed — and gives you enough time to fill the slot again.

> A reschedule with two days of notice is not a problem. An empty chair at 2 pm is.

## Make rescheduling easier than disappearing

If clients have to call to change an appointment and fear an awkward conversation, some prefer not to show up at all. A simple digital way to reschedule lowers that barrier — and brings the appointment back into your calendar.

**Bottom line:** no-shows are not a character flaw of your clients — they are a process problem. A deposit, a reminder, and an easy reschedule path solve most of it.$md$,
 '{no-shows, revenue, scheduling}', 'published', now() - interval '2 days'),

('22222222-2222-4222-8222-222222222203', 'es',
 'reducir-ausencias-proteger-ingresos',
 'Reducir las ausencias: cómo proteger tus ingresos',
 'Cada cita perdida son ingresos que no se recuperan. Tres palancas para reducir notablemente las ausencias en tu estudio.',
 $md$Un cliente que no se presenta te cuesta más que el precio de la sesión: la preparación, el boceto y el hueco bloqueado también se pierden. Sin embargo, la mayoría de las ausencias se pueden evitar con unas pocas medidas estructurales.

## Pedir una seña no es descortesía

La medida individual más eficaz contra las ausencias es una seña vinculante. Filtra pronto las solicitudes poco serias y da seguridad de planificación a ambas partes.

- Comunica la seña con transparencia al reservar
- Descuéntala íntegramente del precio final
- Define reglas claras para los cambios de fecha

## Recordatorios en el momento adecuado

Muchas ausencias son simplemente citas olvidadas. Un recordatorio 48 horas antes da al cliente tiempo para reprogramar si lo necesita — y a ti, tiempo para volver a ocupar el hueco.

> Un cambio con dos días de antelación no es un problema. Una silla vacía a las dos de la tarde, sí.

## Haz que reprogramar sea más fácil que desaparecer

Si el cliente tiene que llamar para cambiar la cita y teme una conversación incómoda, algunos prefieren no aparecer. Una vía digital y sencilla para reprogramar baja esa barrera — y devuelve la cita a tu calendario.

**Conclusión:** las ausencias no son un defecto de carácter de tus clientes, sino un problema de proceso. Una seña, un recordatorio y una vía fácil para reprogramar resuelven la mayor parte.$md$,
 '{ausencias, ingresos, agenda}', 'published', now() - interval '2 days');
