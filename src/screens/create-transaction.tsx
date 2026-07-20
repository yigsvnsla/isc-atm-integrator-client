import React, { useState } from 'react';
import { Text } from 'ink';
import { Stack } from '@/components/ui/stack';
import { Heading } from '@/components/ui/heading';
import { TextInput } from '@/components/ui/text-input';
import { Select } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { StatusMessage } from '@/components/ui/status-message';
import { api } from '../services/api.js';

const OPERATIONS = ['withdrawal', 'deposit', 'transfer', 'balance_inquiry', 'pin_change', 'reversal', 'mini_statement'];
const SOURCE_BANKS = ['bank_a', 'bank_b'];
const TYPES = ['debit', 'credit'];

interface Fields {
    account_id: string;
    amount: string;
    operation: string;
    type: string;
    source_bank: string;
    description: string;
}

const fieldOrder: (keyof Fields)[] = ['account_id', 'amount', 'operation', 'type', 'source_bank', 'description'];

export function CreateTransactionScreen() {
    const [fields, setFields] = useState<Fields>({
        account_id: '', amount: '', operation: 'withdrawal', type: 'debit', source_bank: 'bank_a', description: '',
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
            const body = {
                account_id: fields.account_id,
                amount: fields.amount ? parseInt(fields.amount) : undefined,
                operation: fields.operation,
                type: ['balance_inquiry', 'pin_change', 'mini_statement'].includes(fields.operation) ? undefined : fields.type,
                description: fields.description,
                source_bank: fields.source_bank,
            };
            const res = await api<{ data: { id: string } }>('transactions', { method: 'POST', body });
            setResult(`Created: ${res.data.id}`);
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
            <Heading level={3}>Create Transaction</Heading>
            {step === 0 && (
                <TextInput
                    value={fields.account_id}
                    onChange={update('account_id')}
                    onSubmit={advance}
                    autoFocus
                    label="Account ID"
                    placeholder="Enter account ID"
                />
            )}
            {step === 1 && (
                <TextInput
                    value={fields.amount}
                    onChange={update('amount')}
                    onSubmit={advance}
                    autoFocus
                    label="Amount"
                    placeholder="in cents"
                />
            )}
            {step === 2 && (
                <Select
                    options={OPERATIONS.map(o => ({ value: o, label: o }))}
                    value={fields.operation}
                    onChange={update('operation')}
                    onSubmit={advance}
                    label="Operation"
                />
            )}
            {step === 3 && (
                <Select
                    options={TYPES.map(t => ({ value: t, label: t }))}
                    value={fields.type}
                    onChange={update('type')}
                    onSubmit={advance}
                    label="Type"
                />
            )}
            {step === 4 && (
                <Select
                    options={SOURCE_BANKS.map(b => ({ value: b, label: b }))}
                    value={fields.source_bank}
                    onChange={update('source_bank')}
                    onSubmit={advance}
                    label="Source Bank"
                />
            )}
            {step === 5 && (
                <TextInput
                    value={fields.description}
                    onChange={update('description')}
                    onSubmit={handleSubmit}
                    autoFocus
                    label="Description"
                    placeholder="Optional description"
                />
            )}
            {loading && <Spinner label="Creating..." />}
            {result && (
                <StatusMessage variant={result.startsWith('Error') ? 'error' : 'success'}>
                    {result}
                </StatusMessage>
            )}
            <Text dimColor>Enter to confirm · Esc to cancel</Text>
        </Stack>
    );
}
