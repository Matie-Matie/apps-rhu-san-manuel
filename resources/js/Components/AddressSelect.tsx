import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { BARANGAYS, LOCAL_SUFFIX } from '@/lib/patient';
import { useState } from 'react';

const OTHER = '__other__';

function barangayOf(address: string): string | null {
    if (!address.endsWith(LOCAL_SUFFIX)) return null;
    const name = address.slice(0, -LOCAL_SUFFIX.length);
    return BARANGAYS.includes(name) ? name : null;
}

export default function AddressSelect({
    value,
    onChange,
    error,
}: {
    value: string;
    onChange: (address: string) => void;
    error?: string;
}) {
    // Addresses saved before this dropdown existed (or from outside San Manuel) open in "other" mode.
    const [other, setOther] = useState(() => value !== '' && barangayOf(value) === null);
    const selected = other ? OTHER : (barangayOf(value) ?? '');

    const handleSelect = (v: string) => {
        if (v === OTHER) {
            setOther(true);
            if (barangayOf(value)) onChange('');
        } else {
            setOther(false);
            onChange(v ? `${v}${LOCAL_SUFFIX}` : '');
        }
    };

    return (
        <div>
            <InputLabel htmlFor="address" value="Address" />
            <select
                id="address"
                value={selected}
                onChange={(e) => handleSelect(e.target.value)}
                className="input-field mt-1.5"
            >
                <option value="">Select barangay</option>
                <optgroup label="San Manuel, Isabela">
                    {BARANGAYS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                    ))}
                </optgroup>
                <option value={OTHER}>Other (outside San Manuel)</option>
            </select>
            {other && (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={255}
                    placeholder="Full address"
                    className="input-field mt-2"
                />
            )}
            <InputError message={error} className="mt-2" />
        </div>
    );
}
