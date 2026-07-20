import React, { useState } from 'react';
import { Text, useInput } from 'ink';
import { Stack } from '@/components/ui/stack';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Badge } from '@/components/ui/badge';
import { LoginScreen } from './screens/login.js';
import { DashboardScreen } from './screens/dashboard.js';
import { TransactionsScreen } from './screens/transactions.js';
import { CreateTransactionScreen } from './screens/create-transaction.js';
import { TransferScreen } from './screens/transfer.js';
import { ConciliationScreen } from './screens/conciliation.js';
import { useAuth } from './hooks/use-auth.js';

type Screen = 'login' | 'dashboard' | 'transactions' | 'create' | 'transfer' | 'conciliation';

export function App() {
    const { isLoggedIn, login, logout } = useAuth();
    const [screen, setScreen] = useState<Screen>(isLoggedIn ? 'dashboard' : 'login');
    const [error, setError] = useState('');

    useInput((input, key) => {
        if (!isLoggedIn) return;

        if (key.escape) {
            setScreen('dashboard');
            return;
        }

        if (key.ctrl && input === 'q') {
            process.exit(0);
        }

        const screenMap: Record<string, Screen> = {
            '1': 'dashboard',
            '2': 'transactions',
            '3': 'create',
            '4': 'transfer',
            '5': 'conciliation',
        };

        if (input in screenMap) {
            setScreen(screenMap[input]);
        }
    });

    const handleLogin = async (email: string, password: string) => {
        try {
            setError('');
            await login(email, password);
            setScreen('dashboard');
        } catch (e: unknown) {
            setError((e as Error).message);
        }
    };

    if (!isLoggedIn) {
        return <LoginScreen onLogin={handleLogin} error={error} />;
    }

    return (
        <Stack direction="vertical">
            <Box border borderVariant="muted" paddingX={1}>
                <Stack direction="horizontal" gap={2} alignItems="center">
                    <Heading level={2} uppercase={false}>ISC ATM Integrator</Heading>
                    <Badge variant="default">1:Dash</Badge>
                    <Badge variant="default">2:Txns</Badge>
                    <Badge variant="default">3:New</Badge>
                    <Badge variant="default">4:Xfer</Badge>
                    <Badge variant="default">5:Concil</Badge>
                    <Text> </Text>
                    <Text dimColor>Esc:Home Ctrl+Q:Quit</Text>
                </Stack>
            </Box>
            <Box flexGrow={1} padding={1}>
                {screen === 'dashboard' && <DashboardScreen />}
                {screen === 'transactions' && <TransactionsScreen />}
                {screen === 'create' && <CreateTransactionScreen />}
                {screen === 'transfer' && <TransferScreen />}
                {screen === 'conciliation' && <ConciliationScreen />}
            </Box>
        </Stack>
    );
}
