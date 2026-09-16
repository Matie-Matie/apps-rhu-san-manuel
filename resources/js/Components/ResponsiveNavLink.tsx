import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={
                'flex w-full items-center border-l-4 py-2 pe-4 ps-3 text-base font-medium transition-all duration-200 ease-matie ' +
                (active
                    ? 'border-accent-500 bg-accent-50 text-accent-700'
                    : 'border-transparent text-soil-600 hover:border-soil-300 hover:bg-soil-50 hover:text-soil-800') +
                className
            }
        >
            {children}
        </Link>
    );
}
