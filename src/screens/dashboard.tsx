import React, { useEffect, useState } from 'react';
import { Text } from 'ink';
import { Stack } from '@/components/ui/stack';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { api } from '../services/api.js';

interface TransactionStats {
    data: { total?: number };
    metadata: { pagination?: { totalItems: number } };
}

interface ConciliationSummary {
    data: Array<{ id: string; runAt: string; status: string; summary: { matched: number; discrepancies: number; missing: number } }>;
}

export function DashboardScreen() {
    const [stats, setStats] = useState({ totalTxs: 0, lastConciliation: '', matched: 0, discrepancies: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [txs, concs] = await Promise.all([
                    api<TransactionStats>('transactions?limit=1'),
                    api<ConciliationSummary>('conciliation?limit=1'),
                ]);
                const last = concs.data[0];
                setStats({
                    totalTxs: txs.metadata?.pagination?.totalItems ?? 0,
                    lastConciliation: last?.runAt ? new Date(last.runAt).toLocaleString() : 'N/A',
                    matched: last?.summary?.matched ?? 0,
                    discrepancies: last?.summary?.discrepancies ?? 0,
                });
            } catch {}
            setLoading(false);
        })();
    }, []);

    if (loading) return <Spinner label="Loading dashboard..." />;

    return (
        <Stack direction="vertical" gap={1}>
            <Card title="Dashboard">
                <Stack direction="vertical" gap={1}>
                    <Text>Total Transactions: <Text bold color="green">{stats.totalTxs}</Text></Text>
                    <Text>Last Conciliation: {stats.lastConciliation}</Text>
                    <Stack direction="horizontal" gap={2}>
                        <Text>Matched: {stats.matched}</Text>
                        <Text>Discrepancies: {stats.discrepancies}</Text>
                    </Stack>
                </Stack>
            </Card>
            <Text dimColor>Use number keys to navigate screens</Text>
        </Stack>
    );
}
