import { useState, useEffect } from 'preact/hooks';
import { Badge } from '../components/Badge';
import { InfoCard } from '../components/InfoCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { PageHeading } from '../components/PageHeading';

export function HomeView() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Replace with real Supabase query:
        // supabase.from('items').select('*').then(({ data }) => { ... });
        setTimeout(() => setLoading(false), 600);
    }, []);

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-6">
                <LoadingSkeleton lines={4} />
            </div>
        );
    }

    const stats = [
        { label: 'Total Items', value: '142', sub: '+12 this week' },
        { label: 'Active',      value: '98',  sub: '69% of total' },
        { label: 'Pending',     value: '31',  sub: 'Awaiting review' },
        { label: 'Errors',      value: '3',   sub: 'Needs attention' },
    ];

    return (
        <div className="max-w-5xl mx-auto p-6">
            {/* Standard #4: every view opens with PageHeading — title says where
                you are, description says what you do here. */}
            <PageHeading title="Dashboard" description="Overview of your workspace" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((s, i) => (
                    <div key={i} style={{ animation: `fadeUp 0.35s ease-out ${i * 60}ms both` }}>
                        <InfoCard {...s} />
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-900">Recent Items</h2>
                    <Badge label="Active" />
                </div>
                <div className="p-5">
                    <p className="text-sm text-gray-500">
                        Replace this with a real data table.
                        <a href="#detail/123" className="text-blue-600 hover:underline ml-1">View example detail &rarr;</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
