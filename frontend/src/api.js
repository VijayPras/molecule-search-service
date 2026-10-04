const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/api/molecules/stats`);
  if (!res.ok) throw new Error('Could not reach the API');
  return res.json();
}

export async function searchSimilar(smiles, threshold) {
  const res = await fetch(`${API_BASE}/api/molecules/search/similar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ smiles, threshold }),
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body.error || 'The search could not be completed');
  }

  return body;
}

export async function searchSubstructure(smarts) {
  const res = await fetch(`${API_BASE}/api/molecules/search/substructure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ smarts }),
  });

  const body = await res.json();

  if (!res.ok) {
    throw new Error(body.error || 'The search could not be completed');
  }

  return body;
}
