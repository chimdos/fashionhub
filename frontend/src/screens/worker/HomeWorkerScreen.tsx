import React, { useContext, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    StatusBar,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';
import Toast from 'react-native-toast-message';
import { useFocusEffect } from '@react-navigation/native';

export const HomeWorkerScreen = ({ navigation }: any) => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [bags, setBags] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0 });

    const fetchData = useCallback(async () => {
        try {
            const [bagsRes, statsRes] = await Promise.all([
                api.get('/api/bags/pending'),
                api.get('/api/bags/stats')
            ]);

            setBags(bagsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error("Erro ao carregar dados do worker:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    const BagCard = ({ bag, onPress }: any) => {
        const isPending = bag.status === 'pendente';
        const icon = isPending ? "cube-outline" : "sync-outline";
        const color = isPending ? "#28a745" : "#007bff";
        const statusLabel = isPending ? "Conferir" : "Preparar";

        return (
            <TouchableOpacity style={styles.bagCard} onPress={onPress}>
                <View style={[styles.bagIconContainer, { backgroundColor: `${color}15` }]}>
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <View style={styles.bagInfo}>
                    <Text style={styles.bagTitle}>{bag.codigo || `Mala #${bag.id}`}</Text>
                    <Text style={styles.bagTime}>{bag.descricao || 'Sem descrição'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${color}10` }]}>
                    <Text style={[styles.statusText, { color: color }]}>{statusLabel}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>Bom trabalho,</Text>
                        <Text style={styles.userName}>{user?.nome || 'Colaborador'}</Text>
                    </View>
                    <View style={styles.workerBadge}>
                        <Ionicons name="shield-outline" size={14} color="#28a745" />
                        <Text style={styles.workerBadgeText}>Ajudante</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.miniStatCard}>
                        <Text style={styles.miniStatValue}>{stats.total.toString().padStart(2, '0')}</Text>
                        <Text style={styles.miniStatLabel}>Malas de Hoje</Text>
                    </View>
                    <View style={styles.miniStatCard}>
                        <Text style={styles.miniStatValue}>{stats.pending.toString().padStart(2, '0')}</Text>
                        <Text style={styles.miniStatLabel}>Pendentes</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Malas Pendentes</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#28a745" style={{ marginTop: 20 }} />
                ) : bags.length > 0 ? (
                    bags.map((bag: any) => (
                        <BagCard
                            key={bag.id}
                            bag={bag}
                            onPress={() => navigation.navigate('BagDetail', { bagId: bag.id })}
                        />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>Nenhuma mala pendente por aqui! 🎉</Text>
                    </View>
                )}

                <Text style={styles.sectionTitle}>Atalhos Rápidos</Text>

                <View style={styles.shortcutRow}>
                    <TouchableOpacity
                        style={styles.shortcutButton}
                        onPress={() => navigation.navigate('BagCheck')}
                    >
                        <Ionicons name="scan-outline" size={28} color="#28a745" />
                        <Text style={styles.shortcutLabel}>Escanear Mala</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.shortcutButton}
                        onPress={() => navigation.navigate('Inventory')}
                    >
                        <Ionicons name="list-outline" size={28} color="#28a745" />
                        <Text style={styles.shortcutLabel}>Ver Estoque</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    scrollContent: { padding: 24 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, marginTop: 10 },
    welcomeText: { fontSize: 16, color: '#ADB5BD' },
    userName: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
    workerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    workerBadgeText: { color: '#28a745', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    miniStatCard: { backgroundColor: '#FFF', width: '48%', padding: 20, borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
    miniStatValue: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
    miniStatLabel: { fontSize: 12, color: '#ADB5BD', marginTop: 4 },
    sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#ADB5BD', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 },
    bagCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 20, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8 },
    bagIconContainer: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    bagInfo: { flex: 1, marginLeft: 15 },
    bagTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    bagTime: { fontSize: 13, color: '#ADB5BD', marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    shortcutRow: { flexDirection: 'row', justifyContent: 'space-between' },
    shortcutButton: { backgroundColor: '#FFF', width: '48%', height: 110, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    shortcutLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 10 },
    emptyState: { padding: 20, alignItems: 'center' },
    emptyStateText: { color: '#ADB5BD', fontStyle: 'italic' }
});