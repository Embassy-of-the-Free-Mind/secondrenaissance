import Link from "next/link";
import BlogLayout from "../BlogLayout";
import { generateBlogMetadata, generateArticleJsonLd } from "@/lib/blogMetadata";

const postMeta = {
  title: "Which Renaissance Books Are Scholars Actually Reading?",
  description: "We scraped Google Scholar to find which pre-1700 esoteric texts are most cited in modern academic literature. The results reveal surprising gaps.",
  slug: "incunabula-citations",
  date: "2025-12-22",
};

export const metadata = generateBlogMetadata(postMeta);
const jsonLd = generateArticleJsonLd(postMeta);

export default function IncunabulaCitations() {
  const citationData = [
    { work: "Novum Organum", author: "Bacon", year: 1620, citations: 3437, field: "Scientific Revolution" },
    { work: "De humani corporis fabrica", author: "Vesalius", year: 1543, citations: 1433, field: "Anatomy" },
    { work: "Malleus Maleficarum", author: "Kramer", year: 1487, citations: 1314, field: "Demonology" },
    { work: "Iconologia", author: "Ripa", year: 1593, citations: 1159, field: "Emblematica" },
    { work: "Opera (Ficino trans.)", author: "Dionysius", year: 1480, citations: 579, field: "Mysticism" },
    { work: "Sidereus Nuncius", author: "Galileo", year: 1610, citations: 567, field: "Astronomy" },
    { work: "De Occulta Philosophia", author: "Agrippa", year: 1533, citations: 194, field: "Natural Magic" },
    { work: "Astronomia nova", author: "Kepler", year: 1609, citations: 183, field: "Astronomy" },
    { work: "Atalanta Fugiens", author: "Maier", year: 1617, citations: 171, field: "Alchemy" },
    { work: "De Verbo Mirifico", author: "Reuchlin", year: 1494, citations: 163, field: "Kabbalah" },
    { work: "De Subtilitate", author: "Cardano", year: 1550, citations: 153, field: "Natural Philosophy" },
    { work: "La cena de le ceneri", author: "Bruno", year: 1584, citations: 137, field: "Hermeticism" },
    { work: "Emblemata", author: "Alciato", year: 1531, citations: 117, field: "Emblematica" },
    { work: "Monas Hieroglyphica", author: "Dee", year: 1564, citations: 105, field: "Kabbalah" },
    { work: "Utriusque Cosmi", author: "Fludd", year: 1617, citations: 97, field: "Hermeticism" },
  ];

  const incunabulaData = [
    { work: "Malleus Maleficarum", copies: 94, citations: 1314, ratio: 14.0 },
    { work: "De docta ignorantia", copies: 93, citations: 20, ratio: 0.2 },
    { work: "De Verbo Mirifico", copies: 93, citations: 163, ratio: 1.8 },
    { work: "Corpus Hermeticum", copies: 55, citations: 35, ratio: 0.6 },
    { work: "De vita libri tres", copies: 94, citations: 24, ratio: 0.3 },
    { work: "De magnis coniunctionibus", copies: 129, citations: 0, ratio: 0 },
    { work: "Ars Magna", copies: 2, citations: 81, ratio: 40.5 },
  ];

  return (
    <BlogLayout
      title="Which Renaissance Books Are Scholars Actually Reading?"
      tag="Data"
      slug="incunabula-citations"
      date="December 2024"
      jsonLd={jsonLd}
    >
      <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '20px', color: '#444', lineHeight: 1.7, marginBottom: '32px' }}>
        We scraped Google Scholar to find out which pre-1700 esoteric texts are most cited in modern academic literature.
        The results reveal surprising gaps between historical importance and contemporary scholarly attention.
      </p>

      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', color: '#1a1612', marginTop: '48px', marginBottom: '20px' }}>
        The Data
      </h2>

      <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '17px', color: '#444', lineHeight: 1.7, marginBottom: '24px' }}>
        Using the <code style={{ background: '#f5f0e8', padding: '2px 6px', borderRadius: '3px', fontSize: '15px' }}>scholarly</code> Python
        library, we queried Google Scholar for 101 foundational works in western esotericism and early modern science.
        For each work, we recorded the citation count of the highest-cited edition or translation.
      </p>

      <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '17px', color: '#444', lineHeight: 1.7, marginBottom: '24px' }}>
        We also cross-referenced this with data from <strong>ISTC</strong> (the Incunabula Short Title Catalogue), which tracks
        surviving copies of books printed before 1501. This lets us compare historical circulation with modern scholarly interest.
      </p>

      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', color: '#1a1612', marginTop: '48px', marginBottom: '20px' }}>
        Top 15 by Google Scholar Citations
      </h2>

      <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e8e4dc' }}>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#666' }}>Work</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#666' }}>Author</th>
              <th style={{ textAlign: 'center', padding: '12px 8px', color: '#666' }}>Year</th>
              <th style={{ textAlign: 'right', padding: '12px 8px', color: '#666' }}>Citations</th>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#666' }}>Field</th>
            </tr>
          </thead>
          <tbody>
            {citationData.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f0ebe3' }}>
                <td style={{ padding: '10px 8px', color: '#1a1612', fontWeight: 500 }}>{row.work}</td>
                <td style={{ padding: '10px 8px', color: '#666' }}>{row.author}</td>
                <td style={{ padding: '10px 8px', color: '#888', textAlign: 'center' }}>{row.year}</td>
                <td style={{ padding: '10px 8px', color: '#9e4a3a', fontWeight: 600, textAlign: 'right' }}>{row.citations.toLocaleString()}</td>
                <td style={{ padding: '10px 8px', color: '#666', fontSize: '13px' }}>{row.field}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', color: '#1a1612', marginTop: '48px', marginBottom: '20px' }}>
        Key Findings
      </h2>

      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: '#1a1612', marginTop: '32px', marginBottom: '16px' }}>
        1. The Scientific Revolution dominates
      </h3>

      <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '17px', color: '#444', lineHeight: 1.7, marginBottom: '24px' }}>
        Bacon's <em>Novum Organum</em> (3,437 citations) and Vesalius's <em>De humani corporis fabrica</em> (1,433)
        lead by a wide margin. This reflects the canonization of these works in history of science curricula.
        Galileo and Kepler also rank highly.
      </p>

      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: '#1a1612', marginTop: '32px', marginBottom: '16px' }}>
        2. The Malleus Maleficarum paradox
      </h3>

      <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '17px', color: '#444', lineHeight: 1.7, marginBottom: '24px' }}>
        The infamous witch-hunting manual has 1,314 citations—more than any other pre-1500 esoteric text.
        This likely reflects its importance in gender studies, legal history, and the study of early modern
        persecution rather than any endorsement of its contents.
      </p>

      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: '#1a1612', marginTop: '32px', marginBottom: '16px' }}>
        3. Emblematica is surprisingly well-studied
      </h3>

      <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '17px', color: '#444', lineHeight: 1.7, marginBottom: '24px' }}>
        Ripa's <em>Iconologia</em> (1,159 citations) and Alciato's <em>Emblemata</em> (117) show that
        emblem books—visual encyclopedias of symbols—remain important to art historians and literary scholars.
      </p>

      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: '#1a1612', marginTop: '32px', marginBottom: '16px' }}>
        4. Core Hermetic texts are under-cited
      </h3>

      <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '17px', color: '#444', lineHeight: 1.7, marginBottom: '24px' }}>
        Ficino's <em>Corpus Hermeticum</em> translation has only 35 citations despite being arguably the
        most influential text of the Renaissance Hermetic revival. His <em>De vita libri tres</em> has just 24.
        This may reflect how these texts are cited via secondary literature (especially Frances Yates)
        rather than the primary sources.
      </p>

      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', color: '#1a1612', marginTop: '48px', marginBottom: '20px' }}>
        Survival vs. Scholarship: The ISTC Comparison
      </h2>

      <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '17px', color: '#444', lineHeight: 1.7, marginBottom: '24px' }}>
        For incunabula (pre-1501 printed books), we can compare surviving library copies with modern citations.
        This reveals which historically important texts are being neglected:
      </p>

      <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e8e4dc' }}>
              <th style={{ textAlign: 'left', padding: '12px 8px', color: '#666' }}>Work</th>
              <th style={{ textAlign: 'right', padding: '12px 8px', color: '#666' }}>Surviving Copies</th>
              <th style={{ textAlign: 'right', padding: '12px 8px', color: '#666' }}>GS Citations</th>
              <th style={{ textAlign: 'right', padding: '12px 8px', color: '#666' }}>Citations/Copy</th>
            </tr>
          </thead>
          <tbody>
            {incunabulaData.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f0ebe3' }}>
                <td style={{ padding: '10px 8px', color: '#1a1612', fontWeight: 500 }}>{row.work}</td>
                <td style={{ padding: '10px 8px', color: '#2ea043', fontWeight: 500, textAlign: 'right' }}>{row.copies}</td>
                <td style={{ padding: '10px 8px', color: '#58a6ff', fontWeight: 500, textAlign: 'right' }}>{row.citations}</td>
                <td style={{ padding: '10px 8px', color: row.ratio > 1 ? '#9e4a3a' : '#888', fontWeight: 500, textAlign: 'right' }}>{row.ratio.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '17px', color: '#444', lineHeight: 1.7, marginBottom: '24px' }}>
        <strong>Llull's Ars Magna</strong> has the highest citation-to-copy ratio (40.5)—despite only 2 surviving
        incunabula copies, it has 81 citations. This suggests the text's influence on logic, combinatorics,
        and computer science has given it renewed relevance.
      </p>

      <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '17px', color: '#444', lineHeight: 1.7, marginBottom: '24px' }}>
        Meanwhile, <strong>Albumasar's De magnis coniunctionibus</strong> has 129 surviving copies but
        zero Google Scholar citations—a major text in medieval astrology that modern scholars have apparently forgotten.
      </p>

      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', color: '#1a1612', marginTop: '48px', marginBottom: '20px' }}>
        Implications for Translation
      </h2>

      <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '17px', color: '#444', lineHeight: 1.7, marginBottom: '24px' }}>
        These numbers should inform translation priorities. Works with high surviving copies but low citations
        may be under-studied because they lack accessible modern editions. Albumasar, Cusanus, and Ficino's
        Hermetic translations all fall into this category.
      </p>

      <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '17px', color: '#444', lineHeight: 1.7, marginBottom: '24px' }}>
        Conversely, works like the <em>Malleus Maleficarum</em>—which has multiple modern translations and
        editions—show how accessibility drives scholarly engagement.
      </p>

      <div style={{
        background: '#f5f0e8',
        borderRadius: '8px',
        padding: '24px',
        marginTop: '48px',
        marginBottom: '32px',
        border: '1px solid #e8e4dc'
      }}>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', color: '#1a1612', marginBottom: '12px' }}>
          Explore the Data
        </h3>
        <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '15px', color: '#666', marginBottom: '16px' }}>
          We've built an interactive dashboard to explore citation counts, surviving copies, and digital facsimiles
          for 101 works in western esotericism.
        </p>
        <Link
          href="/bibliography"
          style={{
            display: 'inline-block',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            color: '#fff',
            background: '#9e4a3a',
            padding: '10px 20px',
            borderRadius: '6px',
            textDecoration: 'none',
          }}
        >
          View Bibliography Dashboard
        </Link>
      </div>

      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', color: '#1a1612', marginTop: '48px', marginBottom: '20px' }}>
        Methodology
      </h2>

      <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '17px', color: '#444', lineHeight: 1.7, marginBottom: '24px' }}>
        Citation counts were retrieved from Google Scholar using the <code style={{ background: '#f5f0e8', padding: '2px 6px', borderRadius: '3px', fontSize: '15px' }}>scholarly</code> Python
        library in December 2024. For each work, we searched for "[Author] [Title]" and recorded the
        citation count of the highest-cited result among the top 3.
      </p>

      <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '17px', color: '#444', lineHeight: 1.7, marginBottom: '24px' }}>
        ISTC data comes from the <a href="https://data.cerl.org/istc/" style={{ color: '#9e4a3a' }}>Incunabula Short Title Catalogue</a>,
        which records surviving copies of pre-1501 printed books in libraries worldwide.
      </p>

      <p style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '17px', color: '#444', lineHeight: 1.7, marginBottom: '24px' }}>
        Limitations: Google Scholar's coverage of historical texts is uneven. Works that have been republished
        in modern critical editions will have higher visibility than those only available in rare book collections.
        Citation counts also don't capture references in monographs or non-indexed publications.
      </p>

    </BlogLayout>
  );
}
