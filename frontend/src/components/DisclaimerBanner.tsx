export default function DisclaimerBanner() {
  return (
    <div className="disclaimer-strip" role="note" aria-label="Educational disclaimer">
      <span className="disclaimer-strip-text">
        <span className="disclaimer-strip-icon">⚠️</span>{' '}
        Content is educational, not diagnostic. Always consult qualified professionals.
      </span>
    </div>
  );
}
