// Side quests as a pixel workshop pegboard: each area hangs on a hook as a tag listing what I fix.
import './PegBoard.css';
export default function PegBoard({ areas }) {
  return (
    <div className="pegboard" data-spray-surface="true">
      <ul className="pegboard__grid">
        {areas.map(a => (
          <li key={a.area} className="peg-tag">
            <span className="peg-tag__hook" aria-hidden="true" />
            <h3 className="peg-tag__title">{a.area}</h3>
            <ul className="peg-tag__list">
              {a.items.map(item => <li key={item}>{item}</li>)}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
