import React, { useState } from 'react';
import { Text } from 'ink';
import { Stack } from '@/components/ui/stack';
import { Heading } from '@/components/ui/heading';
import { TextInput } from '@/components/ui/text-input';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { StatusMessage } from '@/components/ui/status-message';
import { api } from '../services/api.js';

const SOURCE_BANKS = ['bank_a', 'bank_b'];

interface Fields {
    from_account: string;
    to_account: string;
    amount: string;
    source_bank: string;
    description: string;
}

const fieldOrder: (keyof Fields)[] = ['from_account', 'to_account', 'amount', 'source_bank', 'description'];

export function TransferScreen() {
    const [fields, setFields] = useState<Fields>({
        from_account: '', to_account: '', amount: '', source_bank: 'bank_a', description: '',
    });
    const [step, setStep] = useState(0);
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const update = (key: keyof Fields) => (value: string) => {
        setFields(f => ({ ...f, [key]: value }));
    };

    const advance = () => {
        if (step < fieldOrder.length - 1) {
            setStep(step + 1);
        }
    };

    const submit = async () => {
        setLoading(true);
        try {
            const res = await api<{ data: Array<{ id: string }> }>('transactions/transfer', {
                method: 'POST',
                body: {
                    from_account_id: fields.from_account,
                    to_account_id: fields.to_account,
                    amount: parseInt(fields.amount),
                    description: fields.description,
                    source_bank: fields.source_bank,
                },
            });
            setResult(`Transfer created: ${res.data.map(t => t.id.slice(0, 8)).join(', ')}`);
        } catch (e: unknown) {
            setResult(`Error: ${(e as Error).message}`);
        }
        setLoading(false);
    };

    const handleSubmit = () => {
        if (step < fieldOrder.length - 1) {
            advance();
        } else {
            submit();
        }
    };

    return (
        <Stack direction="vertical" gap={1}>
            <Heading level={3}>Transfer</Heading>
            {step === 0 && (
                <TextInput
                    value={fields.from_account}
                    onChange={update('from_account')}
                    onSubmit={advance}
                    autoFocus
                    label="From Account"
                    placeholder="Source account ID"
                />
            )}
            {step === 1 && (
                <TextInput
                    value={fields.to_account}
                    onChange={update('to_account')}
                    onSubmit={advance}
                    autoFocus
                    label="To Account"
                    placeholder="Destination account ID"
                />
            )}
            {step === 2 && (
                <TextInput
                    value={fields.amount}
                    onChange={update('amount')}
                    onSubmit={advance}
                    autoFocus
                    label="Amount"
                    placeholder="in cents"
                />
            )}
            {step === 3 && (
                <Select
                    options={SOURCE_BANKS.map(b => ({ value: b, label: b }))}
                    value={fields.source_bank}
                    onChange={update('source_bank')}
                    onSubmit={advance}
                    label="Source Bank"
                />
            )}
            {step === 4 && (
                <TextInput
                    value={fields.description}
                    onChange={update('description')}
                    onSubmit={handleSubmit}
                    autoFocus
                    label="Description"
                    placeholder="Optional description"
                />
            )}
            {loading && <Spinner label="Processing transfer..." />}
            {result && (
                <StatusMessage variant={result.startsWith('Error') ? 'error' : 'success'}>
                    {result}
                </StatusMessage>
            )}
            <Text dimColor>Enter to confirm · Esc to cancel</Text>
        </Stack>
    );
}
