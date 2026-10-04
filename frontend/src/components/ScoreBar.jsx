export default function ScoreBar({ score }) {
  return (
    <div className="score-cell">
      <div className="score-track">
        <div className="score-fill" style={{ width: `${Math.round(score * 100)}%` }} />
      </div>
      <span className="score-value">{score.toFixed(2)}</span>
    </div>
  );
}
