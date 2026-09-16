import { LabelHTMLAttributes } from 'react';

export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string }) {
    return (
        <label {...props} className={'input-label' + (className ? ' ' + className : '')}>
            {value ? value : children}
        </label>
    );
}
