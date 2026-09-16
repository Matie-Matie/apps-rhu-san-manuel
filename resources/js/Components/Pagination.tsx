import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    currentPage: number;
    lastPage: number;
    from?: number | null;
    to?: number | null;
    total?: number | null;
    itemLabel?: string;
}

const perPageOptions = [10, 25, 50];

const navBtn =
    'inline-flex h-8 w-8 items-center justify-center rounded-full text-soil-600 transition-all duration-200 ease-matie hover:bg-soil-100 hover:text-soil-900 disabled:pointer-events-none disabled:text-soil-300';

const chevronLeft = (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

const chevronRight = (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

const chevronDown = (
    <svg className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-soil-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

/** Rebuild a Laravel pagination URL for a different page / page size. */
function buildUrl(anyPageUrl: string, patch: { page?: number; perPage?: number }) {
    const url = new URL(anyPageUrl, window.location.origin);
    if (patch.page !== undefined) url.searchParams.set('page', String(patch.page));
    if (patch.perPage !== undefined) {
        url.searchParams.set('per_page', String(patch.perPage));
        url.searchParams.set('page', '1');
    }
    return url.pathname + url.search;
}

export default function Pagination({
    links,
    currentPage,
    lastPage,
    from,
    to,
    total,
    itemLabel = 'entries',
}: PaginationProps) {
    // Current URL query, so the rows-per-page selector stays in sync with the URL.
    const pageUrl = usePage().url;
    const queryPerPage = Number(new URL(pageUrl, window.location.origin).searchParams.get('per_page')) || 10;

    // Jump-to-page draft, reset whenever the current page changes (navigation remounts props).
    const [draft, setDraft] = useState(String(currentPage));
    useEffect(() => {
        setDraft(String(currentPage));
    }, [currentPage]);

    if (!links || !total) {
        return null;
    }

    // Laravel always sends Previous as the first link and Next as the last.
    const prev = links[0];
    const next = links[links.length - 1];
    const anyPageUrl = prev?.url ?? next?.url;

    const handleJump = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter' || !anyPageUrl) return;
        const page = parseInt(draft, 10);
        if (!Number.isInteger(page) || page < 1 || page > lastPage) {
            setDraft(String(currentPage));
            return;
        }
        if (page === currentPage) return;
        router.get(buildUrl(anyPageUrl, { page }), {}, { preserveScroll: true });
    };

    const handlePerPage = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = Number(e.target.value);
        if (anyPageUrl && value !== queryPerPage) {
            router.get(buildUrl(anyPageUrl, { perPage: value }), {}, { preserveScroll: true });
        }
    };

    return (
        <div className="flex flex-col gap-4 border-t border-soil-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm text-soil-500">
                Showing{' '}
                <span className="font-medium tabular-nums text-soil-900">{from ?? 0}</span>
                {' \u2013 '}
                <span className="font-medium tabular-nums text-soil-900">{to ?? 0}</span>
                {' of '}
                <span className="font-medium tabular-nums text-soil-900">{total}</span> {itemLabel}
            </p>

            <div className="flex flex-wrap items-center gap-4">
                {/* Rows per page */}
                <div className="flex items-center gap-2 text-sm text-soil-500">
                    Rows per page
                    <div className="relative">
                        <select
                            value={queryPerPage}
                            onChange={handlePerPage}
                            aria-label="Rows per page"
                            className="h-9 cursor-pointer appearance-none rounded-control border border-soil-200 bg-surface bg-none pl-3 pr-8 text-sm font-medium text-soil-700 outline-none transition-colors duration-150 hover:border-soil-300 focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
                        >
                            {perPageOptions.map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                        {chevronDown}
                    </div>
                </div>

                {lastPage > 1 && (
                    <>
                        <div className="hidden h-5 w-px bg-soil-200 sm:block" aria-hidden="true" />

                        {/* Segmented nav: prev, page X of Y, next */}
                        <nav className="inline-flex items-center rounded-full border border-soil-200 bg-surface p-1" aria-label="Pagination">
                            {prev?.url ? (
                                <Link href={prev.url} preserveScroll aria-label="Previous page" className={navBtn}>
                                    {chevronLeft}
                                </Link>
                            ) : (
                                <button type="button" disabled aria-label="Previous page" className={navBtn}>
                                    {chevronLeft}
                                </button>
                            )}

                            <div className="flex items-center gap-1.5 px-2 text-sm text-soil-500">
                                Page
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ''))}
                                    onKeyDown={handleJump}
                                    onBlur={() => setDraft(String(currentPage))}
                                    aria-label={`Page number, of ${lastPage}`}
                                    className="h-8 w-11 rounded-control border border-soil-200 bg-surface text-center text-sm font-medium tabular-nums text-soil-900 outline-none transition-colors duration-150 hover:border-soil-300 focus:border-accent-400 focus:ring-2 focus:ring-accent-100"
                                />
                                <span className="tabular-nums">of {lastPage}</span>
                            </div>

                            {next?.url ? (
                                <Link href={next.url} preserveScroll aria-label="Next page" className={navBtn}>
                                    {chevronRight}
                                </Link>
                            ) : (
                                <button type="button" disabled aria-label="Next page" className={navBtn}>
                                    {chevronRight}
                                </button>
                            )}
                        </nav>
                    </>
                )}
            </div>
        </div>
    );
}
