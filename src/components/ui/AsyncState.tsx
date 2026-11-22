import { Button } from "./Button";

export function AsyncState({ loading, error, empty, onRetry }: { loading: boolean; error?: string; empty?: boolean; onRetry?: () => void }) {
  if (loading) return <div className="card async-state">Cargando…</div>;
  if (error) return <div className="card async-state"><p>{error}</p>{onRetry && <Button onClick={onRetry}>Reintentar</Button>}</div>;
  if (empty) return <div className="card async-state">No hay información para mostrar.</div>;
  return null;
}

