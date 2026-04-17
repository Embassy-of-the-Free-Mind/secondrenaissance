"use client";

import BlogLayout from "../BlogLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

// Century breakdown data - BPH LATIN works matched vs unmatched in Internet Archive (fuzzy matching)
const centuryData = [
  { century: "15th", total: 55, matched: 36, unmatched: 19, matchRate: 65.5 },
  { century: "16th", total: 820, matched: 408, unmatched: 412, matchRate: 49.8 },
  { century: "17th", total: 1510, matched: 536, unmatched: 974, matchRate: 35.5 },
  { century: "18th", total: 1040, matched: 195, unmatched: 845, matchRate: 18.8 },
  { century: "19th", total: 675, matched: 121, unmatched: 554, matchRate: 17.9 },
  { century: "20th", total: 4987, matched: 558, unmatched: 4429, matchRate: 11.2 },
];

// Overall coverage pie chart - Latin works only (fuzzy matching)
const coverageData = [
  { name: "In Internet Archive", value: 1991, color: "#8b9a7d" },
  { name: "Not in IA", value: 8692, color: "#9e4a3a" },
];

const COLORS = {
  matched: "#8b9a7d",
  unmatched: "#9e4a3a",
};

interface ClientContentProps {
  jsonLd: string;
}

export default function ClientContent({ jsonLd }: ClientContentProps) {
  return (
    <BlogLayout
      title="How Much Esoteric Latin Is Really Missing from the Internet Archive?"
      tag="Research"
      slug="esoteric-digitization"
      prevPost={{ href: "/blog/hidden-hermetic-library", title: "The Hidden Hermetic Library" }}
      nextPost={{ href: "/blog/digitization-gap", title: "The Digitization Gap" }}
      jsonLd={jsonLd}
    >
      <p style={{
        fontFamily: 'Newsreader, Georgia, serif',
        fontSize: '22px',
        lineHeight: 1.6,
        color: '#444',
        marginBottom: '32px',
      }}>
        We identified 10,683 Latin works from the Bibliotheca Philosophica Hermetica and matched them
        against the Internet Archive using fuzzy title-matching. The results: <strong>18.6% of Latin esoteric works
        are already digitized</strong>—far higher than our initial 2% prefix-match estimate, but with dramatic
        century-by-century variation.
      </p>

      <h2>The Coverage Problem</h2>

      <p>
        The <strong>Bibliotheca Philosophica Hermetica</strong> (BPH) in Amsterdam holds one of the
        world&apos;s finest collections of Hermetic, alchemical, mystical, and esoteric texts. Their
        full catalog contains 27,879 works spanning multiple languages, but we focused specifically
        on the <strong>10,683 Latin works</strong>—the learned language of Renaissance esotericism.
      </p>

      <p>
        We asked a simple question: <strong>How many of these Latin esoteric works can be found in the Internet
        Archive?</strong> The answer reveals a systematic gap in digitization.
      </p>

      {/* Overall Coverage Pie Chart */}
      <figure style={{
        background: '#fff',
        border: '1px solid #e8e4dc',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
      }}>
        <figcaption style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.05em',
          color: '#888',
          marginBottom: '16px',
        }}>
          BPH LATIN WORKS IN INTERNET ARCHIVE
        </figcaption>
        <div style={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={coverageData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {coverageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString()} works`, '']}
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e8e4dc',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '32px',
          marginTop: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: COLORS.matched }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#666' }}>
              1,991 matched (18.6%)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: COLORS.unmatched }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#666' }}>
              8,692 not found (81.4%)
            </span>
          </div>
        </div>
      </figure>

      <p>
        About <strong>18.6% of BPH Latin works</strong> appear in the Internet Archive—a significant improvement
        over our initial 2% prefix-match estimate. Still, that leaves 8,692 Latin esoteric works—spanning
        alchemy, Hermeticism, Kabbalah, Rosicrucianism, and mystical philosophy—without matches in the
        world&apos;s largest open digital library.
      </p>

      <h2>Century-by-Century Breakdown</h2>

      <p>
        The digitization gap varies dramatically by century. Incunabula (15th century) show the highest
        match rate at 65.5%, likely because early printed books have received the most scholarly attention.
        But modern secondary literature (20th century) has only an 11% match rate—often due to copyright restrictions.
      </p>

      {/* Century Bar Chart */}
      <figure style={{
        background: '#fff',
        border: '1px solid #e8e4dc',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
      }}>
        <figcaption style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.05em',
          color: '#888',
          marginBottom: '16px',
        }}>
          DIGITIZATION RATE BY CENTURY
        </figcaption>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={centuryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e4dc" />
              <XAxis
                dataKey="century"
                tick={{ fontSize: 11, fill: '#888' }}
                tickFormatter={(v) => `${v} c.`}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#888' }}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 70]}
              />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e8e4dc',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'matchRate') return [`${value.toFixed(1)}%`, 'Match rate'];
                  return [value, name];
                }}
                labelFormatter={(label) => `${label} century`}
              />
              <Bar dataKey="matchRate" fill={COLORS.matched} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          color: '#aaa',
          marginTop: '12px',
        }}>
          15th-century Latin works (65.5% match rate) are 6x better represented than 20th-century Latin works (11.2%). Nearly half of BPH Latin is 20th-century secondary literature.
        </p>
      </figure>

      <p>
        The 15th century shows the highest match rate at 65.5%, while the 20th century has the lowest
        at just 11.2%. This inverse relationship reflects both the prestige of incunabula in digitization
        projects and copyright restrictions on more recent works. Nearly half of the BPH Latin collection
        consists of 20th-century secondary literature about esotericism—scholarly works that remain
        largely inaccessible.
      </p>

      <h2>The Early Modern Gap</h2>

      <p>
        For our focus period of 1450–1700—the golden age of Renaissance Hermeticism—the numbers are stark:
      </p>

      <figure style={{
        background: '#f5f0e8',
        border: '1px solid #e0d8c8',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e0d8c8' }}>
            <span style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '16px', color: '#444' }}>Total BPH early modern Latin works (1450–1700)</span>
            <span style={{ fontFamily: 'monospace', fontSize: '20px', color: '#1a1612', fontWeight: 600 }}>2,385</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e0d8c8' }}>
            <span style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '16px', color: '#444' }}>Found in Internet Archive</span>
            <span style={{ fontFamily: 'monospace', fontSize: '20px', color: COLORS.matched, fontWeight: 600 }}>980</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <span style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '16px', color: '#444', fontWeight: 600 }}>Not matched in IA</span>
            <span style={{ fontFamily: 'monospace', fontSize: '24px', color: COLORS.unmatched, fontWeight: 600 }}>1,405</span>
          </div>
        </div>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          color: '#888',
          marginTop: '16px',
        }}>
          The Renaissance and early modern period—when alchemy, Hermeticism, and natural magic flourished—has a 41% match rate, higher than later centuries.
        </p>
      </figure>

      <h2>Who&apos;s Missing?</h2>

      <p>
        The top unmatched authors read like a who&apos;s who of Western esotericism. These are
        foundational figures whose works shaped centuries of mystical thought—and they&apos;re
        largely absent from open digital archives.
      </p>

      {/* Top Authors Table */}
      <figure style={{
        background: '#f5f0e8',
        border: '1px solid #e0d8c8',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
        overflow: 'hidden',
      }}>
        <figcaption style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.05em',
          color: '#888',
          marginBottom: '16px',
        }}>
          TOP AUTHORS NOT IN INTERNET ARCHIVE
        </figcaption>
        <table style={{
          width: '100%',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          borderCollapse: 'collapse',
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0d8c8' }}>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Author</th>
              <th style={{ textAlign: 'right', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Missing Works</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#1a1612', fontWeight: 600 }}>Tradition</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Basilius Valentinus", "237", "Alchemy"],
              ["Jacob Boehme", "232", "Christian theosophy"],
              ["Paracelsus", "173", "Alchemical medicine"],
              ["Giordano Bruno", "103", "Hermetic philosophy"],
              ["Caspar Schwenckfeld", "97", "Radical Reformation"],
              ["Ramon Lull", "76", "Ars combinatoria, mysticism"],
              ["Henry More", "65", "Cambridge Platonism"],
              ["Antoinette Bourignon", "59", "Christian mysticism"],
              ["Thomas Vaughan", "35", "Rosicrucianism, alchemy"],
              ["Emanuel Swedenborg", "29", "Visionary theology"],
            ].map(([author, works, tradition], i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e0d8c8' }}>
                <td style={{ padding: '12px 8px', color: '#1a1612' }}>{author}</td>
                <td style={{ padding: '12px 8px', textAlign: 'right', fontFamily: 'monospace', color: '#9e4a3a' }}>{works}</td>
                <td style={{ padding: '12px 8px', color: '#666' }}>{tradition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>

      <p>
        Basilius Valentinus, the legendary alchemist, has 237 works in the BPH that cannot be found in
        the Internet Archive. Jacob Boehme, the German mystic who influenced figures from William Blake
        to Hegel, has 232 missing works. These foundational esoteric authors remain largely inaccessible online.
      </p>

      <h2>Sample Missing Works</h2>

      <p>
        To give a sense of what&apos;s unavailable, here are some significant works we couldn&apos;t
        match in the Internet Archive:
      </p>

      <ul>
        <li><strong>Marsilio Ficino</strong> — <em>De christiana religione</em> (1476): The Florentine
        Neoplatonist&apos;s synthesis of Christianity and Platonic philosophy</li>
        <li><strong>Hermes Trismegistus</strong> — <em>De potestate ac sapiencia dei</em> (1471):
        An early printed edition of the foundational Hermetic texts</li>
        <li><strong>Thomas a Kempis</strong> — <em>De imitatione Christi</em> (various early editions):
        One of the most influential devotional works ever written</li>
        <li><strong>Heinrich Cornelius Agrippa</strong> — Multiple Latin editions of his magical and
        occult philosophy treatises</li>
        <li><strong>Giordano Bruno</strong> — Several of his philosophical dialogues on memory,
        cosmology, and Hermetic magic</li>
      </ul>

      <h2>Methodology</h2>

      <p>
        This analysis required two steps: identifying Latin works in the BPH collection, then
        matching them against the Internet Archive.
      </p>

      <h3 style={{ fontSize: '18px', marginTop: '24px' }}>Step 1: Language Detection</h3>

      <p>
        The BPH catalog has a <code>language</code> field, but 58% of records have it set to
        &ldquo;Unknown&rdquo; or null. Only 0.4% were explicitly labeled as Latin—clearly an
        undercount for a collection focused on Renaissance esoteric literature.
      </p>

      <p>
        We built a regex-based language detector to identify Latin works from their titles.
        The detector looks for:
      </p>

      <ul>
        <li><strong>Latin prepositions:</strong> <em>de</em>, <em>in</em>, <em>ad</em>, <em>ex</em>, <em>pro</em>, <em>per</em>, <em>cum</em></li>
        <li><strong>Common Latin terms:</strong> <em>liber</em>, <em>tractatus</em>, <em>summa</em>, <em>opera</em>, <em>commentarii</em></li>
        <li><strong>Case endings:</strong> Words ending in <em>-orum</em>, <em>-arum</em>, <em>-ibus</em> (Latin declensions)</li>
        <li><strong>Subject markers:</strong> <em>philosophia</em>, <em>theologia</em>, <em>alchemia</em>, <em>hermetica</em>, <em>cabala</em></li>
      </ul>

      <p>
        This approach identified <strong>10,683 Latin works</strong> (38% of the collection)—a far
        more plausible figure for a Hermetic library. We also detected German (8,051), Dutch (2,231),
        French (660), and Italian (114) works, leaving 6,547 of uncertain language.
      </p>

      <h3 style={{ fontSize: '18px', marginTop: '24px' }}>Step 2: Title Matching</h3>

      <p>
        We matched BPH Latin titles against 222,407 Latin texts from the Internet Archive using
        fuzzy matching with multiple strategies:
      </p>

      <ol>
        <li><strong>Normalization:</strong> Titles were lowercased, stripped of punctuation, and Latin ligatures (ae/oe) expanded</li>
        <li><strong>Word indexing:</strong> We extracted significant words (4+ characters, excluding stopwords) to find candidate matches efficiently</li>
        <li><strong>Fuzzy scoring:</strong> Used token set ratio matching (threshold: 85) to handle word order differences and partial matches</li>
        <li><strong>Multiple strategies:</strong> Exact prefix, substring, fuzzy, and author+title matching combined</li>
      </ol>

      <h3 style={{ fontSize: '18px', marginTop: '24px' }}>Step 3: Verification</h3>

      <p>
        To test our matching accuracy, we randomly selected 10 &ldquo;unmatched&rdquo; Latin works and
        manually searched the Internet Archive. The results reveal important limitations:
      </p>

      <figure style={{
        background: '#f5f0e8',
        border: '1px solid #e0d8c8',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
        overflow: 'hidden',
      }}>
        <figcaption style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.05em',
          color: '#888',
          marginBottom: '16px',
        }}>
          MANUAL VERIFICATION OF 10 RANDOM &ldquo;UNMATCHED&rdquo; WORKS
        </figcaption>
        <table style={{
          width: '100%',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          borderCollapse: 'collapse',
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0d8c8' }}>
              <th style={{ textAlign: 'left', padding: '10px 6px', color: '#1a1612', fontWeight: 600 }}>BPH Title</th>
              <th style={{ textAlign: 'left', padding: '10px 6px', color: '#1a1612', fontWeight: 600 }}>Author</th>
              <th style={{ textAlign: 'center', padding: '10px 6px', color: '#1a1612', fontWeight: 600 }}>In IA?</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Arcanum hermeticae philosophiae opus", "Espagnet", true],
              ["Oedipus chimicus", "Becher", true],
              ["Lilium inter spinas", "Johannes de Padua", true],
              ["Somniorum Synesiorum", "Cardano", true],
              ["De calido innato sive igne animali", "Conring", true],
              ["Chymicus deo bene placens", "anonymous", false],
            ].map(([title, author, found], i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e0d8c8' }}>
                <td style={{ padding: '10px 6px', color: '#1a1612', fontStyle: 'italic' }}>{title as string}</td>
                <td style={{ padding: '10px 6px', color: '#666' }}>{author as string}</td>
                <td style={{ padding: '10px 6px', textAlign: 'center', color: found ? '#8b9a7d' : '#9e4a3a', fontWeight: 600 }}>
                  {found ? 'Yes' : 'No'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '11px',
          color: '#888',
          marginTop: '16px',
        }}>
          5 of 6 Latin samples (83%) were actually in IA but missed by our matching. 4 samples were in German/French (excluded from this table).
        </p>
      </figure>

      <p>
        <strong>The verification revealed a significant limitation:</strong> At least 5 of the 6 Latin works
        we checked were actually in the Internet Archive—but under different titles. For example:
      </p>

      <ul>
        <li><strong>BPH title:</strong> &ldquo;Arcanum hermeticae philosophiae opus&rdquo;</li>
        <li><strong>IA title:</strong> &ldquo;Bibliotheca chemica contracta... Tractatus alter inscriptus
        Arcanum hermeticae philosophiae opus...&rdquo;</li>
      </ul>

      <p>
        The IA entry is an anthology that <em>contains</em> the BPH work, but with a completely different
        title prefix. Our 50-character prefix matching cannot detect this.
      </p>

      <h3 style={{ fontSize: '18px', marginTop: '24px' }}>What This Means for Our Numbers</h3>

      <p>
        After implementing fuzzy matching, our match rate jumped from 2% to 18.6%. This confirms what
        manual verification suggested—many works are present but under variant titles. However,
        <strong>81% of Latin esoteric works still have no match</strong> in the Internet Archive,
        even with sophisticated fuzzy matching.
      </p>

      <p>
        The verification also reveals a metadata problem: even when works <em>are</em> digitized,
        poor cataloging makes them invisible to researchers. The BPH uses standardized titles; the
        Internet Archive often uses the title page transcription of whatever anthology happens to
        contain the text. Improved fuzzy matching helps, but cannot solve fundamental cataloging inconsistencies.
      </p>

      <h2>What This Means</h2>

      <p>
        Even with improved matching, over 80% of BPH Latin works have no confirmed match in the Internet
        Archive. The story isn&apos;t pure digitization failure—it&apos;s a combination of factors:
      </p>

      <ul>
        <li><strong>Metadata inconsistency:</strong> Works that <em>are</em> digitized often have
        completely different title forms, making them effectively invisible to researchers</li>
        <li><strong>Anthology problem:</strong> Many esoteric works appear inside anthologies or
        compendia, not as standalone items—our 18.6% may still be an undercount</li>
        <li><strong>Translation bottleneck:</strong> Even accessible Latin texts require translation—these
        8,692 unmatched works remain inaccessible to modern readers</li>
        <li><strong>Copyright barriers:</strong> 20th-century secondary literature (47% of BPH Latin)
        has only 11% coverage, likely due to copyright restrictions</li>
      </ul>

      <h2>The Path Forward</h2>

      <p>
        The real challenge isn&apos;t just digitization—it&apos;s discoverability and accessibility.
        The BPH and similar specialized libraries hold the physical copies. What&apos;s needed is:
      </p>

      <ul>
        <li><strong>Targeted digitization partnerships</strong> between archives and digital libraries</li>
        <li><strong>Funding for scanning and OCR</strong> of esoteric collections specifically</li>
        <li><strong>AI-assisted translation</strong> to make Latin texts accessible to modern readers</li>
        <li><strong>Metadata standardization</strong> to improve discoverability across platforms</li>
      </ul>

      <p>
        The Renaissance Hermetic tradition—alchemy, magic, mysticism, theosophy—shaped modern
        science, psychology, and spirituality in ways we&apos;re only beginning to understand.
        Making these texts accessible is not antiquarian nostalgia; it&apos;s intellectual archaeology.
      </p>
    </BlogLayout>
  );
}
