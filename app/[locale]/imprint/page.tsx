// Impressum — static legal page, German law, no i18n needed.
// Own metadata: DE canonical for every prefix, no hreflang (D5).
import { legalPageMetadata } from "@/lib/seo/site-metadata";

export const metadata = legalPageMetadata({
  path: "/imprint",
  title: "Impressum – TODA",
  description:
    "Impressum der TODA Tattoo Solutions S.L., Anbieter der TODA App für Tattoo Artists: Anschrift, Vertretung, Kontakt und Registerdaten.",
});

export default function ImprintPage() {
  return (
    <div className="min-h-svh pt-24 pb-20">
      <div className="mx-auto max-w-2xl px-6">
        <h1 className="text-text-primary mb-10 text-[28px] font-semibold tracking-tight">
          Impressum
        </h1>

        <div className="prose-legal">
          <h2>Anbieter / Technischer Plattformanbieter</h2>
          <p>
            <strong>TODA Tattoo Solutions S.L.</strong>
            <br />
            Carrer de Miquel Barceló 2-4, Bloque A2 Apt. 201
            <br />
            07180 Calvià (Illes Balears), Spanien
          </p>
          <p>
            <strong>Vertreten durch:</strong>
            <br />
            Geschäftsführer: Manuel Lindner
          </p>
          <p>
            <strong>Kontakt:</strong>
            <br />
            E-Mail: <a href="mailto:manuel@todasolutions.com">manuel@todasolutions.com</a>
          </p>
          <p>
            <strong>NIF:</strong>
            <br />
            B26574699
          </p>
          <p>
            <strong>Registereintrag:</strong>
            <br />
            Registro Mercantil de Palma de Mallorca
            <br />
            Registerdaten: 1000464938265
          </p>

          <h2>Hinweis zu den auf dieser Website dargestellten Leistungen</h2>
          <p>
            Die auf dieser Website dargestellten Leistungen werden vom{" "}
            <strong>jeweiligen Tätowierer bzw. dem jeweiligen Studio</strong> erbracht.
          </p>
          <p>
            <strong>Kontakt für Termin- und Leistungsanfragen:</strong>
            <br />
            <a href="mailto:manuel@todasolutions.com">manuel@todasolutions.com</a>
          </p>

          <h2>Verantwortungsbereich</h2>
          <p>
            <strong>TODA Tattoo Solutions S.L.</strong> stellt die technische Plattform für diese
            Website bereit. Die Bearbeitung von Termin- und Leistungsanfragen sowie die direkte
            Kommunikation mit Interessenten erfolgt durch den jeweiligen Tätowierer bzw. das
            jeweilige Studio.
          </p>

          <h2>Hinweis nach § 18 MStV</h2>
          <p>Keine journalistisch-redaktionellen Inhalte.</p>

          <h2>Verbraucherstreitbeilegung</h2>
          <p>
            Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>

          <h2>Geltung</h2>
          <p>
            Dieses Impressum gilt für diese Website und die darüber bereitgestellten Inhalte und
            Kontaktmöglichkeiten.
          </p>
        </div>
      </div>
    </div>
  );
}
