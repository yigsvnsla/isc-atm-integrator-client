import React, { useEffect, useState } from 'react';
import { Text } from 'ink';
import { Stack } from '@/components/ui/stack';
import { Table } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { StatusMessage } from '@/components/ui/status-message';
import { api } from '../services/api.js';

interface Transaction {
    id: string;
    amount?: number;
    operation: string;
    type?: string;
    state: string;
    description: string;
    bankAccountId: string;
    correlationId?: string;
    sourceBank: string;
    createdAt: string;
}

interface TxResponse {
    data: Transaction[];
    metadata: { pagination?: { page: number; limit: number; totalItems: number } };
}

const FILTER_OPTIONS = ['all', 'bank_a', 'bank_b'];

const stateColor = (state: string): string => {
    switch (state) {
        case 'success': return 'green';
        case 'pending': return 'yellow';
        default: return 'red';
    }
};

export function TransactionsScreen() {
    const [txs, setTxs] = useState<Transaction[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Transaction | null>(null);

    const limit = 10;

    useEffect(() => {
        setLoading(true);
        const params: Record<string, string | number | undefined> = { page, limit };
        if (filter !== 'all') params.sourceBank = filter;

        api<TxResponse>('transactions', { params })
            .then(res => {
                setTxs(res.data);
                setTotal(res.metadata?.pagination?.totalItems ?? 0);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [page, filter]);

    const columns = [
        { key: 'id' as const, header: 'ID', width: 10 },
        { key: 'operation' as const, header: 'Op', width: 16 },
        { key: 'amount' as const, header: 'Amount', width: 10, align: 'right' as const },
        { key: 'state' as const, header: 'State', width: 10 },
        { key: 'sourceBank' as const, header: 'Bank', width: 8 },
    ];

    if (loading) return <Spinner label="Loading transactions..." />;

    const totalPages = Math.ceil(total / limit);
    const flatTxs: Array<Record<string, unknown>> = txs.map(tx => ({
        id: tx.id,
        operation: tx.operation,
        amount: tx.amount != null ? `$${(tx.amount / 100).toFixed(2)}` : '-',
        state: tx.state,
        sourceBank: tx.sourceBank,
    }));

    return (
        <Stack direction="vertical" gap={1}>
            <Stack direction="horizontal" gap={1}>
                <Text bold>Transactions</Text>
                {FILTER_OPTIONS.map(f => (
                    <Badge
                        key={f}
                        variant={filter === f ? 'info' : 'default'}
                        bordered={filter === f}
                    >
                        {f === 'all' ? 'All' : f}
                    </Badge>
                ))}
            </Stack>
            {selected && (
                <StatusMessage variant="info">
                    {`Selected: ${selected.id.slice(0, 8)}.. | ${selected.operation} | $${(selected.amount ?? 0) / 100}`}
                </StatusMessage>
            )}
            <Table
                data={flatTxs}
                columns={columns}
                sortable
                selectable
                maxRows={limit}
                onSelect={(row) => {
                    const found = txs.find(tx => tx.id === String(row.id));
                    if (found) setSelected(found);
                }}
            />
            <Pagination
                total={totalPages}
                current={page}
                onChange={setPage}
            />
            <Text dimColor>↑↓ navigate · s sort · Enter select · p/n page</Text>
        </Stack>
    );
}
