import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition-all duration-200 ease-matie focus:outline-none ' +
                (active
                    ? 'border-accent-500 text-soil-900'
                    : 'border-transparent text-soil-500 hover:border-soil-300 hover:text-soil-700') +
                className
            }
        >
            {children}
        </Link>
    );
}
