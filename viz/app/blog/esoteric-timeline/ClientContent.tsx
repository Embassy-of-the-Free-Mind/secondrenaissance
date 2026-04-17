"use client";

import BlogLayout from "../BlogLayout";
import { useEffect, useState } from "react";

interface TimelineData {
  [year: string]: {
    [tradition: string]: number;
  };
}

interface RiverInfo {
  color: string;
  description: string;
}

const rivers: Record<string, RiverInfo> = {
  hermetica: { color: "#9b59b6", description: "Corpus Hermeticum & Egyptian wisdom" },
  alchemy: { color: "#f1c40f", description: "Transmutation & the philosopher's stone" },
  mysticism: { color: "#3498db", description: "Christian contemplative tradition" },
  rosicrucianism: { color: "#e74c3c", description: "The Rosicrucian Brotherhood" },
  kabbalah: { color: "#2ecc71", description: "Jewish mysticism & Tree of Life" },
  neoplatonism: { color: "#1abc9c", description: "Platonic philosophy & theurgy" },
  magic: { color: "#8e44ad", description: "Ceremonial & natural magic" },
  paracelsianism: { color: "#e67e22", description: "Paracelsian medicine & philosophy" },
  theosophy: { color: "#34495e", description: "Jacob Boehme & followers" }
};

interface ClientContentProps {
  jsonLd: string;
}

export default function ClientContent({ jsonLd }: ClientContentProps) {
  const [timelineData, setTimelineData] = useState<TimelineData>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetch("/rivers_of_life.json")
      .then(res => res.json())
      .then(data => {
        setTimelineData(data.timeline || {});
        setIsLoaded(true);
      })
      .catch(err => console.error("Failed to load timeline:", err));
  }, []);

  const years = Object.keys(timelineData).sort();
  const startYear = 1469;
  const endYear = 1750;

  // Calculate totals for each year
  const getYearTotal = (year: string) => {
    const yearData = timelineData[year];
    if (!yearData) return 0;
    return Object.values(yearData).reduce((sum, count) => sum + count, 0);
  };

  // Get max total for scaling
  const maxTotal = Math.max(...years.map(y => getYearTotal(y)), 1);

  if (!isLoaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#666' }}>Loading timeline...</div>
      </div>
    );
  }

  return (
    <BlogLayout
      title="Rivers of Esoteric Life: Interactive Timeline"
      tag="Data Visualization"
      slug="esoteric-timeline"
      nextPost={{ href: "/blog/hunting-for-translations", title: "Hunting for Translations" }}
      jsonLd={jsonLd}
    >
      <p style={{
        fontFamily: 'Newsreader, Georgia, serif',
        fontSize: '22px',
        lineHeight: 1.6,
        color: '#444',
        marginBottom: '32px',
      }}>
        A visual journey through 280 years of occult, mystical, and hermetic publishing in early modern Europe (1469-1750). Watch how different esoteric traditions flowed, merged, and diverged through the centuries.
      </p>

      <div style={{
        background: '#f5f0e8',
        border: '1px solid #e0d8c8',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '32px',
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: '#1a1612' }}>
          Legend: The Nine Streams
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {Object.entries(rivers).map(([key, info]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: info.color, flexShrink: 0 }} />
              <span style={{ color: '#1a1612', textTransform: 'capitalize', fontWeight: 500 }}>{key}</span>
            </div>
          ))}
        </div>
      </div>

      <h2>The Timeline</h2>

      <p>
        When Marsilio Ficino translated the <em>Corpus Hermeticum</em> in 1463, he believed he was recovering wisdom older than Moses. This sparked a torrent of esoteric publishing that would flow for centuries--books on alchemy, magic, Kabbalah, and mysticism that shaped the intellectual underground of early modern Europe.
      </p>

      {/* Timeline visualization by decade */}
      {Array.from({ length: Math.ceil((endYear - startYear) / 10) }, (_, i) => {
        const decadeStart = startYear + i * 10;
        const decadeEnd = Math.min(decadeStart + 9, endYear);
        const decadeYears = years.filter(y => {
          const n = parseInt(y);
          return n >= decadeStart && n <= decadeEnd;
        });

        const decadeTotal = decadeYears.reduce((sum, y) => sum + getYearTotal(y), 0);

        return (
          <div
            key={decadeStart}
            style={{
              borderTop: i === 0 ? 'none' : '1px solid #e0d8c8',
              paddingTop: i === 0 ? 0 : '32px',
              marginTop: i === 0 ? 0 : '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1612', margin: 0 }}>{decadeStart}s</h3>
              <span style={{ fontSize: '14px', color: '#666' }}>{decadeTotal} publications</span>
            </div>

            {/* Year bars visualization */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {decadeYears.map(year => {
                const yearData = timelineData[year];
                if (!yearData) return null;
                const total = getYearTotal(year);

                return (
                  <div key={year} style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '48px',
                        textAlign: 'right',
                        fontFamily: 'Monaco, Courier, monospace',
                        fontSize: '13px',
                        color: '#666',
                        flexShrink: 0,
                      }}>
                        {year}
                      </div>
                      <div style={{
                        flex: 1,
                        height: '32px',
                        background: '#f5f0e8',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        display: 'flex',
                        border: '1px solid #e0d8c8',
                      }}>
                        {Object.entries(rivers).map(([tradition, info]) => {
                          const count = yearData[tradition] || 0;
                          if (count === 0) return null;
                          const width = (count / maxTotal) * 100;
                          return (
                            <div
                              key={tradition}
                              style={{
                                width: `${width}%`,
                                backgroundColor: info.color,
                                minWidth: count > 0 ? "2px" : "0",
                              }}
                              title={`${tradition}: ${count}`}
                            />
                          );
                        })}
                      </div>
                      <div style={{
                        width: '40px',
                        textAlign: 'right',
                        fontSize: '13px',
                        color: '#666',
                        fontFamily: 'Monaco, Courier, monospace',
                        flexShrink: 0,
                      }}>
                        {total}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <h2 style={{ marginTop: '48px' }}>Key Historical Moments</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', margin: '32px 0' }}>
        <div style={{ borderLeft: '4px solid #9b59b6', paddingLeft: '16px' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>1463: Ficino Translates the Corpus Hermeticum</h3>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            Marsilio Ficino completes his Latin translation of the Corpus Hermeticum for Cosimo de&apos; Medici, sparking the Renaissance revival of Hermeticism.
          </p>
        </div>

        <div style={{ borderLeft: '4px solid #2ecc71', paddingLeft: '16px' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>1486: Pico della Mirandola&apos;s 900 Theses</h3>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            Pico publishes his syncretic theses combining Kabbalah, Hermeticism, and Christian theology--the birth of Christian Kabbalah.
          </p>
        </div>

        <div style={{ borderLeft: '4px solid #8e44ad', paddingLeft: '16px' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>1531: Agrippa&apos;s De Occulta Philosophia</h3>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            Heinrich Cornelius Agrippa publishes his encyclopedic synthesis of Renaissance magic, natural philosophy, and Kabbalah.
          </p>
        </div>

        <div style={{ borderLeft: '4px solid #e67e22', paddingLeft: '16px' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>1541: Paracelsus Dies</h3>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            The death of Paracelsus triggers decades of posthumous publications. His iatrochemistry challenges Galenic medicine.
          </p>
        </div>

        <div style={{ borderLeft: '4px solid #e74c3c', paddingLeft: '16px' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>1614: The Fama Fraternitatis</h3>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            The first Rosicrucian manifesto appears, describing a secret brotherhood of Christian adepts. It ignites a publishing frenzy across Europe.
          </p>
        </div>

        <div style={{ borderLeft: '4px solid #e74c3c', paddingLeft: '16px' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>1617: Peak Rosicrucian Furor</h3>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            The Rosicrucian controversy reaches its height: 28 publications this year alone debate whether the Brotherhood exists.
          </p>
        </div>

        <div style={{ borderLeft: '4px solid #34495e', paddingLeft: '16px' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>1642: Boehme&apos;s Works Spread</h3>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            Jacob Boehme&apos;s theosophical works begin circulating widely after his death, influencing mysticism across Europe.
          </p>
        </div>
      </div>

      <h2>What the Rivers Reveal</h2>

      <p>This data reveals what conventional intellectual history often obscures: esoteric publishing was not marginal but constituted a significant portion of early modern print culture. The peaks around 1615-1620 (the Rosicrucian controversy) and 1680s (the Boehme revival) show how these &quot;underground&quot; ideas periodically erupted into mainstream discourse.</p>

      <p>The interweaving of traditions is equally significant. Alchemy rarely appears alone--it flows alongside Hermeticism, Paracelsianism, and Christian mysticism. The Christian Kabbalists drew on Neoplatonism. The Rosicrucians synthesized them all.</p>

      <h2>By the Numbers</h2>

      <figure style={{
        background: '#f5f0e8',
        border: '1px solid #e0d8c8',
        borderRadius: '8px',
        padding: '24px',
        margin: '32px 0',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px' }}>
          {Object.entries(rivers).map(([tradition, info]) => {
            const total = years.reduce((sum, year) => {
              return sum + (timelineData[year]?.[tradition] || 0);
            }, 0);
            return (
              <div key={tradition} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  margin: '0 auto 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: info.color,
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>
                    {Math.round(total / 100) || "<1"}c
                  </span>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1612', marginBottom: '4px' }}>{total}</div>
                <div style={{ fontSize: '14px', color: '#444', textTransform: 'capitalize', marginBottom: '4px' }}>{tradition}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{info.description}</div>
              </div>
            );
          })}
        </div>
      </figure>

      <h2>Data Sources</h2>

      <p>
        Data from{" "}
        <a href="https://www.ustc.ac.uk/" style={{ color: '#9e4a3a' }} target="_blank" rel="noopener noreferrer">
          USTC
        </a>
        , aligned with{" "}
        <a href="https://embassyofthefreemind.com/" style={{ color: '#9e4a3a' }} target="_blank" rel="noopener noreferrer">
          Bibliotheca Philosophica Hermetica
        </a>
        {" "}collection themes.
      </p>

      <p style={{ marginTop: '32px', fontSize: '14px', color: '#666' }}>
        Most of these works remain untranslated. The rivers still flow, waiting to be rediscovered.
      </p>
    </BlogLayout>
  );
}
