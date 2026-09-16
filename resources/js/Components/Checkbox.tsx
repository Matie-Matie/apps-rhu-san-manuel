import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded-[6px] border-soil-200 bg-white text-accent-600 shadow-sm focus:ring-2 focus:ring-accent-500/20 focus:ring-offset-0 ' +
                className
            }
        />
    );
}
