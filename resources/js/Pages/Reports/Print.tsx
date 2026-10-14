import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

const PERIOD_TITLES: Record<string, string> = {
    daily: 'Daily Report',
    weekly: 'Weekly Report',
    monthly: 'Monthly Report',
    quarterly: 'Quarterly Report',
    annual: 'Annual Report',
    custom: 'Custom Period Report',
};

export default function ReportPrint({ period, range, report, generatedBy, generatedAt }: any) {
    useEffect(() => {
        const t = setTimeout(() => window.print(), 400);
        return () => clearTimeout(t);
    }, []);

    const title = PERIOD_TITLES[period] ?? 'Report';

    const th = 'border-b border-black py-1.5 text-left font-semibold';
    const td = 'border-b border-gray-300 py-1.5';

    return (
        <>
            <Head title={`${title} - ${range.label}`} />
            <div className="min-h-screen bg-white text-black">
                <div className="print:hidden flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-3">
                    <span className="text-sm text-gray-600">Print preview</span>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="rounded-md bg-black px-4 py-1.5 text-sm font-medium text-white">
                            Print
                        </button>
                        <button onClick={() => window.close()} className="rounded-md border border-gray-300 px-4 py-1.5 text-sm">
                            Close
                        </button>
                    </div>
                </div>

                <div className="mx-auto max-w-[760px] px-8 py-8 text-sm">
                    <div className="border-b-2 border-black pb-3 text-center">
                        <img src="/assets/logo.jpg" alt="" className="mx-auto mb-2 h-14 w-14 rounded-lg object-cover" />
                        <h1 className="text-xl font-bold">Rural Health Unit Clinic</h1>
                        <p className="text-sm">San Manuel, Isabela</p>
                        <h2 className="mt-3 text-lg font-semibold">{title}</h2>
                        <p className="font-medium">{range.label}</p>
                        {period === 'weekly' && (
                            <p className="text-xs text-gray-600">{range.start_date} to {range.end_date}</p>
                        )}
                    </div>

                    <h3 className="mt-6 font-bold">Summary</h3>
                    <table className="mt-1 w-full border-collapse">
                        <tbody>
                            <tr><td className={td}>Prescriptions written</td><td className={`${td} text-right tabular-nums font-semibold`}>{report.total_prescriptions}</td></tr>
                            <tr><td className={td}>Unique patients</td><td className={`${td} text-right tabular-nums font-semibold`}>{report.unique_patients}</td></tr>
                            <tr><td className={td}>Prescriptions dispensed</td><td className={`${td} text-right tabular-nums font-semibold`}>{report.total_dispensed}</td></tr>
                            <tr><td className={td}>Pending / Validated / Cancelled</td>
                                <td className={`${td} text-right tabular-nums font-semibold`}>
                                    {report.by_status.pending} / {report.by_status.validated} / {report.by_status.cancelled}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <h3 className="mt-6 font-bold">Top Diagnoses</h3>
                    {report.top_diagnoses.length > 0 ? (
                        <table className="mt-1 w-full border-collapse">
                            <thead>
                                <tr><th className={th}>#</th><th className={th}>Diagnosis</th><th className={`${th} text-right`}>Cases</th><th className={`${th} text-right`}>Share</th></tr>
                            </thead>
                            <tbody>
                                {report.top_diagnoses.map((d: any, i: number) => (
                                    <tr key={d.diagnosis}>
                                        <td className={`${td} w-8`}>{i + 1}</td>
                                        <td className={td}>{d.diagnosis}</td>
                                        <td className={`${td} text-right tabular-nums`}>{d.count}</td>
                                        <td className={`${td} text-right tabular-nums`}>{d.percent}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="mt-1 text-gray-600">No diagnoses recorded in this period.</p>
                    )}

                    <h3 className="mt-6 font-bold">Top Dispensed Medicines</h3>
                    {report.top_medicines.length > 0 ? (
                        <table className="mt-1 w-full border-collapse">
                            <thead>
                                <tr><th className={th}>#</th><th className={th}>Medicine</th><th className={`${th} text-right`}>Qty dispensed</th></tr>
                            </thead>
                            <tbody>
                                {report.top_medicines.map((m: any, i: number) => (
                                    <tr key={m.id}>
                                        <td className={`${td} w-8`}>{i + 1}</td>
                                        <td className={td}>{m.generic_name}</td>
                                        <td className={`${td} text-right tabular-nums`}>{Number(m.dispensed_quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="mt-1 text-gray-600">No medicines dispensed in this period.</p>
                    )}

                    <p className="mt-10 text-xs text-gray-500">
                        Generated {new Date(generatedAt).toLocaleString()} by {generatedBy}
                    </p>
                </div>
            </div>
        </>
    );
}
