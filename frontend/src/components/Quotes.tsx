import { Quote } from '@/lib/types';

interface Props {
  quotes: Quote[];
}

export default function Quotes({ quotes }: Props) {
  return (
    <section className="quotes-section" id="quotes">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">Words of Wisdom</div>
          <h2 className="section-title">Let these words guide you</h2>
        </div>
        <div className="quotes-grid">
          {quotes.map((q, i) => (
            <div key={i} className={`quote-card${i === 1 ? ' accent' : ''}`}>
              <div className="qc-quote">&ldquo;{q.quote_text}&rdquo;</div>
              <div className="qc-author">— {q.author}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
