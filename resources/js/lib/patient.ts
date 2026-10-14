// The 19 barangays of San Manuel, Isabela (PSA list).
export const BARANGAYS = [
    'Brgy. Agliam',
    'Brgy. Babanuang',
    'Brgy. Cabaritan',
    'Brgy. Caraniogan',
    'Brgy. Eden',
    'Brgy. Malalinta',
    'Brgy. Mararigue',
    'Brgy. Nueva Era',
    'Brgy. Pisang',
    'District 1 (Poblacion)',
    'District 2 (Poblacion)',
    'District 3 (Poblacion)',
    'District 4 (Poblacion)',
    'Brgy. San Francisco',
    'Brgy. Sandiat Centro',
    'Brgy. Sandiat East',
    'Brgy. Sandiat West',
    'Brgy. Santa Cruz',
    'Brgy. Villanueva',
];

export const LOCAL_SUFFIX = ', San Manuel, Isabela';

export const MIN_DOB = '1900-01-01';

export function todayISO(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function ageFromDob(dob: string | null | undefined): number | null {
    if (!dob) return null;
    const [y, m, d] = dob.slice(0, 10).split('-').map(Number);
    if (!y || !m || !d) return null;
    const now = new Date();
    let age = now.getFullYear() - y;
    if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
    return age >= 0 ? age : null;
}

export function formatDate(value: string | null | undefined): string {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}
