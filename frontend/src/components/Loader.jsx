export default function Loader({ label = 'Loading' }) {
  return (
    <span className="d-inline-flex align-items-center gap-2 text-body-secondary">
      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
