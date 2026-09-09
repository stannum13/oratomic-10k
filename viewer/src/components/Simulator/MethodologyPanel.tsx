import { METHODOLOGY_ITEMS, PAPER_URL, REPOSITORY_URL } from "@/lib/methodology";

export function MethodologyPanel() {
  return (
    <div className="methodology-panel">
      {METHODOLOGY_ITEMS.map((item) => (
        <div className="methodology-item" key={item.kind}>
          <div className="methodology-kind">{item.kind}</div>
          <div className="methodology-title">{item.title}</div>
          <p>{item.detail}</p>
        </div>
      ))}
      <div className="methodology-links">
        <a href={PAPER_URL} target="_blank" rel="noreferrer">Cain et al., arXiv:2603.28627 ↗</a>
        <a href={REPOSITORY_URL} target="_blank" rel="noreferrer">Implementation and model code ↗</a>
      </div>
    </div>
  );
}
