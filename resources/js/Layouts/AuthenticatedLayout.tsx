import { InertiaLinkProps, Link, router, usePage } from '@inertiajs/react';
import { createContext, Dispatch, PropsWithChildren, ReactNode, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
import { Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import Toaster from '@/Components/Toaster';

interface NavItem {
    name: string;
    route: string;
    params?: Record<string, any>;
    icon: string;
}

interface NavSection {
    label: string;
    items: NavItem[];
}

const doctorNav: NavSection[] = [
    {
        label: 'Clinical',
        items: [
            { name: 'Dashboard', route: 'dashboard', icon: 'grid' },
            { name: 'Patients', route: 'patients.index', icon: 'users' },
            { name: 'Prescriptions', route: 'prescriptions.index', icon: 'file-text' },
        ],
    },
    {
        label: 'Reports',
        items: [{ name: 'Reports', route: 'reports.index', icon: 'bar-chart' }],
    },
];

const staffNav: NavSection[] = [
    {
        label: 'Front Desk',
        items: [{ name: 'Patients', route: 'patients.index', icon: 'users' }],
    },
];

const pharmacistNav: NavSection[] = [
    {
        label: 'Clinical',
        items: [
            { name: 'Dashboard', route: 'dashboard', icon: 'grid' },
            { name: 'Patients', route: 'patients.index', icon: 'users' },
            { name: 'Prescriptions', route: 'prescriptions.index', icon: 'file-text' },
        ],
    },
    {
        label: 'Pharmacy',
        items: [
            { name: 'Medicines', route: 'medicines.index', icon: 'pill' },
            { name: 'Inventory', route: 'inventory.index', icon: 'package' },
        ],
    },
    {
        label: 'Reports',
        items: [{ name: 'Reports', route: 'reports.index', icon: 'bar-chart' }],
    },
];

const adminNav: NavSection[] = [
    {
        label: 'Administration',
        items: [{ name: 'Activity Logs', route: 'activity-logs.index', icon: 'activity' }],
    },
];

function NavIcon({ icon }: { icon: string }) {
    const icons: Record<string, JSX.Element> = {
        grid: (
            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
        ),
        users: (
            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
        ),
        'file-text': (
            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
        ),
        'bar-chart': (
            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
        ),
        pill: (
            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.045-5.045a3 3 0 010-4.243l2.569-2.57a3 3 0 014.243 0l5.045 5.045m-5.045 5.045l5.045 5.045m-5.045-5.045l2.569-2.569a3 3 0 014.243 0l2.569 2.569" />
            </svg>
        ),
        package: (
            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
        ),
        activity: (
            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
            </svg>
        ),
    };

    return icons[icon] || null;
}

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const role = user?.role || 'doctor';
    const navSections = role === 'admin' ? adminNav : role === 'pharmacist' ? pharmacistNav : role === 'staff' ? staffNav : doctorNav;
    const initial = (user?.name || 'U').charAt(0).toUpperCase();
    // Pathname only (not query string) so pagination / search don't replay the entrance
    const pagePath = usePage().url.split('?')[0];

    const [sidebarOpen, setSidebarOpen] = useState(false);
    // Search targets whichever list the user is on; anywhere else it searches patients.
    const searchRoute = pagePath.startsWith('/medicines') ? 'medicines.index'
        : pagePath.startsWith('/inventory') ? 'inventory.index'
        : 'patients.index';
    const urlSearch = new URLSearchParams(usePage().url.split('?')[1] || '').get('search') || '';
    const [search, setSearch] = useState(urlSearch);
    const searchRef = useRef<HTMLInputElement>(null);
    const lastSubmitted = useRef(urlSearch);

    useEffect(() => {
        setSearch(urlSearch);
        lastSubmitted.current = urlSearch;
    }, [pagePath, urlSearch]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const runSearch = (value: string) => {
        const q = value.trim();
        if (q === lastSubmitted.current) return;
        lastSubmitted.current = q;
        router.get(route(searchRoute), q ? { search: q } : {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    // Live search while typing (debounced) on list pages.
    useEffect(() => {
        if (search.trim() === lastSubmitted.current) return;
        const t = setTimeout(() => runSearch(search), 350);
        return () => clearTimeout(t);
    }, [search]);

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') runSearch(search);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-bg">
            <Toaster />

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar: white, 250px */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r border-soil-200 bg-surface transition-all duration-300 ease-matie lg:static lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Logo */}
                <Link
                    href={route('dashboard')}
                    className="flex items-center gap-2.5 px-5 pt-5 pb-4"
                    aria-label="APPS - go to dashboard"
                >
                    <img
                        src="/assets/logo.jpg"
                        alt="APPS logo"
                        className="h-9 w-9 rounded-[10px] object-cover shadow-sm"
                    />
                    <span className="block text-[18px] font-bold leading-tight tracking-tight text-soil-900">APPS</span>
                </Link>

                {/* Navigation sections */}
                <nav className="flex-1 overflow-y-auto px-3 pb-4">
                    {navSections.map((section) => (
                        <div key={section.label} className="mt-4">
                            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-soil-500">
                                {section.label}
                            </p>
                            <div className="space-y-0.5">
                                {section.items.map((item) => {
                                    const isActive = route().current(item.route + '*');
                                    return (
                                        <Link
                                            key={item.route}
                                            href={route(item.route, item.params)}
                                            className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                                        >
                                            <span className={isActive ? 'text-accent-500' : 'text-soil-400'}>
                                                <NavIcon icon={item.icon} />
                                            </span>
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User info at bottom */}
                <div className="border-t border-soil-200 p-3">
                    <div className="flex items-center gap-2.5 rounded-[10px] px-2 py-1.5">
                        <div className="relative shrink-0">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 text-sm font-semibold text-accent-600">
                                {initial}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-surface" />
                        </div>
                        <div className="min-w-0 flex-1 leading-tight">
                            <p className="truncate text-[13px] font-medium text-soil-900">{user.name}</p>
                            <span className="text-[11px] capitalize text-soil-500">{role}</span>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="rounded-[8px] p-1.5 text-soil-400 transition-colors duration-150 hover:bg-soil-100 hover:text-error"
                            title="Log out"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main area */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top header */}
                <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-soil-200 bg-surface px-4 lg:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="inline-flex items-center justify-center rounded-[10px] border border-soil-200 bg-surface p-2 text-soil-500 transition-all duration-150 hover:scale-105 hover:bg-soil-100 hover:text-soil-700 lg:hidden"
                            aria-label="Open menu"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>

                        {/* Page heading */}
                        {header && (
                            <h1 className="truncate text-[15px] font-semibold tracking-tight text-soil-900">
                                {header}
                            </h1>
                        )}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2.5">
                        {/* Search */}
                        <div className={`relative hidden ${role === 'admin' ? '' : 'md:block'}`}>
                            <svg
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-soil-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                            <input
                                type="text"
                                ref={searchRef}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                placeholder={searchRoute === 'medicines.index' ? 'Search medicines...' : searchRoute === 'inventory.index' ? 'Search inventory...' : 'Search patients...'}
                                className="h-9 w-60 rounded-[10px] border border-soil-200 bg-surface pl-9 pr-12 text-sm text-soil-900 placeholder:text-soil-400 transition-all duration-200 ease-matie focus:border-accent-500 focus:outline-none focus:ring-4 focus:ring-accent-200 lg:w-72"
                            />
                            <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-soil-200 bg-soil-100 px-1.5 py-0.5 text-[11px] font-medium text-soil-500">
                                ⌘K
                            </kbd>
                        </div>

                        {/* Settings */}
                        <Link
                            href={route('profile.edit')}
                            className="hidden h-9 w-9 items-center justify-center rounded-[10px] border border-soil-200 bg-surface text-soil-500 transition-all duration-150 hover:scale-105 hover:bg-soil-100 hover:text-soil-800 sm:inline-flex"
                            aria-label="Settings"
                        >
                            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </Link>

                        {/* Notifications */}
                        <NotificationBell />

                        {/* Profile chip */}
                        <div className="relative">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button aria-label="Account menu" className="flex items-center rounded-[10px] px-1.5 py-1 text-sm text-soil-700 transition-colors duration-150 hover:bg-soil-100">
                                        <div className="relative">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 text-sm font-semibold text-accent-600">
                                                {initial}
                                            </div>
                                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success ring-2 ring-surface" />
                                        </div>
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>
                                        Profile
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    <motion.div
                        key={pagePath}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}

// ─── Notification bell ───

interface AppNotification {
    id: string;
    tone: 'info' | 'warning' | 'danger' | 'success';
    title: string;
    body: string;
    href: string;
}

const NOTE_DOT: Record<AppNotification['tone'], string> = {
    info: 'bg-accent-500',
    warning: 'bg-orange-500',
    danger: 'bg-red-600',
    success: 'bg-success',
};

function NotificationBell() {
    const notifications = (usePage().props.notifications ?? []) as AppNotification[];
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open]);

    return (
        <div className="relative hidden sm:block">
            <button
                onClick={() => setOpen((o) => !o)}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-soil-200 bg-surface text-soil-500 transition-all duration-150 hover:scale-105 hover:bg-soil-100 hover:text-soil-800"
                aria-label={notifications.length ? `Notifications (${notifications.length})` : 'Notifications'}
                aria-expanded={open}
            >
                <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {notifications.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-surface">
                        {notifications.length}
                    </span>
                )}
            </button>

            {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}

            <Transition
                show={open}
                enter="transition ease-matie duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-control border border-soil-200 bg-surface shadow-dropdown">
                    <div className="border-b border-soil-200 px-4 py-3 text-sm font-semibold text-soil-900">Notifications</div>
                    {notifications.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-soil-500">You're all caught up.</p>
                    ) : (
                        <ul className="max-h-80 divide-y divide-soil-100 overflow-y-auto">
                            {notifications.map((n) => (
                                <li key={n.id}>
                                    <Link
                                        href={n.href}
                                        onClick={() => setOpen(false)}
                                        className="flex items-start gap-3 px-4 py-3 transition-colors duration-150 hover:bg-accent-50"
                                    >
                                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${NOTE_DOT[n.tone]}`} />
                                        <span className="min-w-0">
                                            <span className="block text-sm font-medium text-soil-900">{n.title}</span>
                                            {n.body && <span className="block text-xs text-soil-500">{n.body}</span>}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Transition>
        </div>
    );
}

// ─── Inline Dropdown component ───

const DropDownContext = createContext<{
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    toggleOpen: () => void;
}>({
    open: false,
    setOpen: () => {},
    toggleOpen: () => {},
});

function Dropdown({ children }: PropsWithChildren) {
    const [open, setOpen] = useState(false);
    const toggleOpen = () => setOpen((s) => !s);
    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div className="relative">{children}</div>
        </DropDownContext.Provider>
    );
}

function Trigger({ children }: PropsWithChildren) {
    const { open, setOpen, toggleOpen } = useContext(DropDownContext);
    return (
        <>
            <div onClick={toggleOpen}>{children}</div>
            {open && (
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            )}
        </>
    );
}

function Content({
    align = 'right',
    width = '48',
    contentClasses = 'py-1',
    children,
}: PropsWithChildren<{
    align?: 'left' | 'right';
    width?: '48';
    contentClasses?: string;
}>) {
    const { open } = useContext(DropDownContext);
    let alignmentClasses = 'origin-top';
    if (align === 'left') {
        alignmentClasses = 'ltr:origin-top-left rtl:origin-top-right start-0';
    } else {
        alignmentClasses = 'ltr:origin-top-right rtl:origin-top-left end-0';
    }
    return (
        <Transition
            show={open}
            enter="transition ease-matie duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
        >
            <div
                className={`absolute z-50 mt-2 w-48 rounded-control border border-soil-200 bg-surface py-1 shadow-dropdown ${alignmentClasses}`}
            >
                <div className={contentClasses}>{children}</div>
            </div>
        </Transition>
    );
}

function DropdownLink({ className = '', children, ...props }: InertiaLinkProps) {
    return (
        <Link
            {...props}
            className={
                'block w-full px-4 py-2 text-left text-sm text-soil-700 transition-colors duration-150 ease-matie hover:bg-accent-50 hover:text-accent-600 ' +
                className
            }
        >
            {children}
        </Link>
    );
}

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;
