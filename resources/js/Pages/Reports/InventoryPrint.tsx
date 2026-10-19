import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import { formatDate, InventoryReport, STATUS_LABEL } from './Inventory';

export default function InventoryReportPrint({ report, generatedBy, generatedAt }: { report: InventoryReport; generatedBy: string; generatedAt: string }) {
    useEffect(() => {
        const t = setTimeout(() => window.print(), 400);
        return () => clearTimeout(t);
    }, []);

    // window.close() is ignored on tabs the page did not open itself, so fall back to the report page.
    const closePreview = () => {
        window.close();
        setTimeout(() => {
            window.location.href = route('reports.index');
        }, 150);
    };

    const { summary, rows } = report;
    const th = 'border-b border-black py-1.5 text-left font-semibold';
    const td = 'border-b border-gray-300 py-1.5';

    return (
        <>
            <Head title="Medicine Inventory Report" />
            <div className="min-h-screen bg-white text-black">
                <div className="print:hidden flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-3">
                    <span className="text-sm text-gray-600">Print preview</span>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="rounded-md bg-black px-4 py-1.5 text-sm font-medium text-white">
                            Print
                        </button>
                        <button onClick={closePreview} className="rounded-md border border-gray-300 px-4 py-1.5 text-sm">
                            Close
                        </button>
                    </div>
                </div>

                <div className="mx-auto max-w-[860px] px-8 py-8 text-sm">
                    <div className="border-b-2 border-black pb-3 text-center">
                        <img src="/assets/logo.jpg" alt="" className="mx-auto mb-2 h-14 w-14 rounded-lg object-cover" />
                        <h1 className="text-xl font-bold">Rural Health Unit Clinic</h1>
                        <p className="text-sm">San Manuel, Isabela</p>
                        <h2 className="mt-3 text-lg font-semibold">Medicine Inventory Report</h2>
                        <p className="font-medium">As of {formatDate(report.as_of)}</p>
                    </div>

                    <table className="mt-5 w-full">
                        <tbody>
                            {[
                                ['Medicines on record', summary.medicines],
                                ['Total units in stock', summary.units],
                                ['Low-stock batches', summary.low],
                                ['Medicines out of stock', summary.out],
                                ['Batches expiring within 30 days', summary.expiring],
                                ['Expired batches still on hand', summary.expired],
                                ['Archived batches (not counted)', summary.archived_batches],
                            ].map(([label, value]) => (
                                <tr key={label as string}>
                                    <td className={td}>{label}</td>
                                    <td className={`${td} text-right font-semibold tabular-nums`}>{value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <h3 className="mb-2 mt-6 font-semibold">Stock by medicine</h3>
                    <table className="w-full text-[12px]">
                        <thead>
                            <tr>
                                <th className={th}>Medicine</th>
                                <th className={th}>Strength / Form</th>
                                <th className={`${th} text-right`}>Stock</th>
                                <th className={`${th} text-right`}>Batches</th>
                                <th className={th}>Nearest expiry</th>
                                <th className={`${th} text-right`}>Dispensed (30d)</th>
                                <th className={th}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r) => (
                                <tr key={r.id}>
                                    <td className={td}>{r.generic_name}{r.brand_name ? ` (${r.brand_name})` : ''}</td>
                                    <td className={td}>{[r.strength, r.dosage_form].filter(Boolean).join(' · ') || 'N/A'}</td>
                                    <td className={`${td} text-right tabular-nums`}>{r.stock}</td>
                                    <td className={`${td} text-right tabular-nums`}>{r.batches}</td>
                                    <td className={`${td} tabular-nums`}>{formatDate(r.nearest_expiry)}</td>
                                    <td className={`${td} text-right tabular-nums`}>{r.dispensed_30d}</td>
                                    <td className={td}>{STATUS_LABEL[r.status]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-8 flex justify-between text-xs text-gray-600">
                        <span>Generated by {generatedBy}</span>
                        <span>{new Date(generatedAt).toLocaleString('en-US')}</span>
                    </div>
                </div>
            </div>
        </>
    );
}
