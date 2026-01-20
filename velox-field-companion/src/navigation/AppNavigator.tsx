import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DashboardScreen } from '../screens/DashboardScreen';
import { LoginScreen } from '../components/LoginScreen';

interface AppNavigatorProps {
    isAuthenticated: boolean;
    currentUser: string | null;
    onLoginSuccess: () => void;
    onLogout: () => void;
}

export const AppNavigator = ({ isAuthenticated, currentUser, onLoginSuccess, onLogout }: AppNavigatorProps) => {
    return (
        <View style={styles.container}>
            {isAuthenticated && currentUser ? (
                // 🚀 AUTHENTICATED: Show Dashboard
                <DashboardScreen user={currentUser} onLogout={onLogout} />
            ) : (
                // 🔒 LOCKED: Show Login
                <LoginScreen onLoginSuccess={onLoginSuccess} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 }
});