import { hospital } from '../config/hospital.js';

/**
 * Clearly marked placeholder for information the hospital has not confirmed.
 * Renders "[label to be confirmed]" so it can never be mistaken for real data.
 */
export default function Pending({ label, block = false }) {
  const Tag = block ? 'p' : 'span';
  return (
    <Tag className={`pending${block ? ' pending--block' : ''}`} title="Placeholder — the hospital must confirm this before publication">
      [{label} to be confirmed]
    </Tag>
  );
}

/** Small badge marking content that still needs verification. */
export function DraftBadge({ children = 'Draft — verify' }) {
  if (!hospital.draftMode) return null;
  return <span className="draft-badge">{children}</span>;
}
