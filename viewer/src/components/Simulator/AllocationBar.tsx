"use client";

import { useSimulator } from "@/store/simulator";
import { deriveAllocation } from "@/lib/simulator-presentation";

export function AllocationBar() {
  const breakdown = useSimulator((state) => state.computed.qubitBreakdown);
  const allocation = deriveAllocation(breakdown);

  return (
    <section className="allocation" aria-label="Physical-qubit allocation">
      <div className="component-heading">
        <h2>Where the qubits go</h2>
        <p>Layout lives in 3D; proportion lives here.</p>
      </div>
      <div className="allocation__bar" aria-hidden="true">
        {allocation.map((segment) => <span key={segment.id} data-zone={segment.id} style={{ width: `${segment.percent}%` }} />)}
      </div>
      <div className="allocation__legend">
        {allocation.map((segment) => (
          <div key={segment.id}>
            <span className="allocation__mark" data-zone={segment.id} aria-hidden="true" />
            <span>{segment.label}</span>
            <strong>{segment.count.toLocaleString()}</strong>
            <small>{segment.percent.toFixed(1)}%</small>
          </div>
        ))}
      </div>
    </section>
  );
}
