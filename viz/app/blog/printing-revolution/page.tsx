import BlogLayout from "../BlogLayout";
import { generateBlogMetadata, generateArticleJsonLd } from "@/lib/blogMetadata";

const postMeta = {
  title: "The Printing Revolution: 1.6 Million Books Visualized",
  description: "From Gutenberg to Newton: an interactive visualization of European book production 1450-1700, with historical events mapped to publishing patterns.",
  slug: "printing-revolution",
  date: "2025-12-17",
};

export const metadata = generateBlogMetadata(postMeta);
const jsonLd = generateArticleJsonLd(postMeta);

export default function PrintingRevolution() {
  return (
    <BlogLayout
      title="The Printing Revolution: 1.6 Million Books Visualized"
      tag="Data Visualization"
      slug="printing-revolution"
      prevPost={{ href: "/blog/death-of-latin", title: "The Death of Latin" }}
      jsonLd={jsonLd}
    >
      <p style={{
        fontFamily: 'Newsreader, Georgia, serif',
        fontSize: '22px',
        lineHeight: 1.6,
        color: '#444',
        marginBottom: '32px',
      }}>
        From Gutenberg's first experiments in the 1450s to the close of the 17th century,
        European printing underwent exponential growth. This visualization shows the annual
        output of all printed works recorded in the Universal Short Title Catalogue.
      </p>

      <div style={{
        background: '#1a1a2e',
        borderRadius: '12px',
        overflow: 'hidden',
        margin: '32px -24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      }}>
        <iframe
          src="/ustc_total_publishing.html"
          style={{
            width: '100%',
            height: '750px',
            border: 'none',
            display: 'block',
          }}
          title="USTC Total Publishing Over Time"
        />
      </div>

      <h2>Key Observations</h2>

      <p>
        Several patterns emerge from the data:
      </p>

      <ul style={{
        fontFamily: 'Newsreader, Georgia, serif',
        fontSize: '18px',
        lineHeight: 1.8,
        color: '#444',
        marginLeft: '24px',
        marginBottom: '24px',
      }}>
        <li style={{ marginBottom: '12px' }}>
          <strong>The 1500 Spike:</strong> Jubilee years brought surges in religious printing.
          The year 1500 saw double the output of 1499.
        </li>
        <li style={{ marginBottom: '12px' }}>
          <strong>The Reformation Effect (1517-1530):</strong> Luther's 95 Theses sparked an
          explosion of pamphlets and polemical literature. German printing especially surged.
        </li>
        <li style={{ marginBottom: '12px' }}>
          <strong>The 1640s Explosion:</strong> The English Civil War generated unprecedented
          levels of political and religious printing, with 1648 showing a major peak.
        </li>
        <li style={{ marginBottom: '12px' }}>
          <strong>The 1680 Spike:</strong> The Exclusion Crisis in England and religious
          controversies across Europe drove another surge in political pamphlets.
        </li>
        <li style={{ marginBottom: '12px' }}>
          <strong>Steady Growth:</strong> By 1700, annual output had reached nearly 19,000
          editions per year — a far cry from the handful of books printed in the 1450s.
        </li>
      </ul>

      <h2>What the Timeline Shows</h2>

      <p>
        Switch to the "Historical Timeline" view to see year-by-year publishing output aligned
        with historical events. Major events like the Reformation, the Thirty Years' War, and
        the English Civil War all correlate with visible changes in publishing patterns.
      </p>

      <figure style={{
        background: '#f5f0e8',
        border: '1px solid #e0d8c8',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#1a1612' }}>
          Summary Statistics
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#444' }}>Total Editions (1450-1700)</span>
            <span style={{ fontFamily: 'monospace', color: '#9e4a3a', fontWeight: 600 }}>1,628,578</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#444' }}>Peak Year</span>
            <span style={{ fontFamily: 'monospace', color: '#9e4a3a', fontWeight: 600 }}>1680 (19,334 editions)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#444' }}>Average per Year (1690s)</span>
            <span style={{ fontFamily: 'monospace', color: '#9e4a3a', fontWeight: 600 }}>~17,600 editions</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#444' }}>Growth Factor (1450s to 1690s)</span>
            <span style={{ fontFamily: 'monospace', color: '#9e4a3a', fontWeight: 600 }}>~3,400x</span>
          </div>
        </div>
      </figure>

      <h2>Data Source</h2>

      <p>
        This visualization uses the complete{" "}
        <a href="https://ustc.ac.uk" style={{ color: '#9e4a3a' }}>
          Universal Short Title Catalogue
        </a>{" "}
        database (July 2025 edition), maintained by the University of St Andrews.
        The USTC catalogs every known book printed in Europe from the invention of
        printing through 1700.
      </p>

      <p>
        The data represents <em>catalogued editions</em> — actual production was likely
        higher, as many ephemeral works (single-sheet broadsides, pamphlets) have been lost.
      </p>
    </BlogLayout>
  );
}
