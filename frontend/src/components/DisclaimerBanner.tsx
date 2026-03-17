export default function DisclaimerBanner() {
  return (
    <div className="disclaimer-strip" role="note" aria-label="Educational disclaimer">
      <span className="disclaimer-strip-icon">⚠️</span>
      <span className="disclaimer-strip-text">
        Content on this site is <strong>educational only — not diagnostic or medical advice</strong>.
        Always consult a licensed professional.
      </span>
    </div>
  );
}
