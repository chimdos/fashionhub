import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';

export const HomeWorkerScreen = ({ navigation }: any) => {
    const { user } = useContext(AuthContext);

    const TaskCard = ({ title, time, status, icon, color }: any) => (
        <TouchableOpacity style={styles.taskCard}>
            <View style={[styles.taskIconContainer, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>{title}</Text>
                <Text style={styles.taskTime}>{time}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${color}10` }]}>
                <Text style={[styles.statusText, { color: color }]}>{status}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

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
                        <Text style={styles.miniStatValue}>04</Text>
                        <Text style={styles.miniStatLabel}>Malas de Hoje</Text>
                    </View>
                    <View style={styles.miniStatCard}>
                        <Text style={styles.miniStatValue}>01</Text>
                        <Text style={styles.miniStatLabel}>Pendente</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Tarefas Pendentes</Text>

                <TaskCard
                    title="Mala de Verão #402"
                    time="Chegada às 10:30"
                    status="Conferir"
                    icon="cube-outline"
                    color="#28a745"
                />

                <TaskCard
                    title="Retorno de Mala #398"
                    time="Saída às 14:00"
                    status="Preparar"
                    icon="sync-outline"
                    color="#007bff"
                />

                <Text style={styles.sectionTitle}>Atalhos Rápidos</Text>

                <View style={styles.shortcutRow}>
                    <TouchableOpacity style={styles.shortcutButton} onPress={() => navigation.navigate('BagCheck')}>
                        <Ionicons name="scan-outline" size={28} color="#28a745" />
                        <Text style={styles.shortcutLabel}>Escanear Mala</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.shortcutButton} onPress={() => navigation.navigate('Inventory')}>
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

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 10
    },
    welcomeText: { fontSize: 16, color: '#ADB5BD' },
    userName: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },

    workerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20
    },
    workerBadgeText: { color: '#28a745', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    miniStatCard: {
        backgroundColor: '#FFF',
        width: '48%',
        padding: 20,
        borderRadius: 20,
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8
    },
    miniStatValue: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
    miniStatLabel: { fontSize: 12, color: '#ADB5BD', marginTop: 4 },

    sectionTitle: {
        fontSize: 13, fontWeight: 'bold', color: '#ADB5BD',
        textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1
    },

    taskCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
        padding: 16, borderRadius: 20, marginBottom: 12,
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8
    },
    taskIconContainer: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    taskInfo: { flex: 1, marginLeft: 15 },
    taskTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    taskTime: { fontSize: 13, color: '#ADB5BD', marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 12, fontWeight: 'bold' },

    shortcutRow: { flexDirection: 'row', justifyContent: 'space-between' },
    shortcutButton: {
        backgroundColor: '#FFF', width: '48%', height: 110, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center',
        elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10
    },
    shortcutLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 10 },
});