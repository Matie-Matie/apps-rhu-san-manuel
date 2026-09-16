import { HTMLAttributes } from 'react';

export default function InputError({
    message,
    className = '',
    ...props
}: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    return message ? (
        <p {...props} className={'input-error' + (className ? ' ' + className : '')}>
            {message}
        </p>
    ) : null;
}
