import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export const BagHistoryDetailsScreen = ({ route }: any) => {
    const { bag } = route.params;

    const getStatusStyle = (status: string) => {
        const key = status?.toUpperCase();

        const styles: any = {
            'SOLICITADA': { label: 'Solicitada', color: '#F39C12', bg: '#FEF5E7' },
            'ANALISE': { label: 'Em Análise', color: '#F39C12', bg: '#FEF5E7' },

            'PREPARANDO': { label: 'Em Preparo', color: '#3498DB', bg: '#EBF5FB' },
            'RECUSADA': { label: 'Recusada', color: '#E74C3C', bg: '#FDEDEC' },

            'AGUARDANDO_MOTO': { label: 'Buscando Entregador', color: '#8E44AD', bg: '#F5EEF8' },
            'MOTO_A_CAMINHO_LOJA': { label: 'Entregador indo à Loja', color: '#8E44AD', bg: '#F5EEF8' },
            'EM_ROTA_ENTREGA': { label: 'Mala a caminho', color: '#27AE60', bg: '#EAFAF1' },
            'ENTREGUE': { label: 'Mala com você', color: '#2ECC71', bg: '#D4EFDF' },

            'AGUARDANDO_MOTO_DEVOLUCAO': { label: 'Aguardando Coleta', color: '#D35400', bg: '#FDF2E9' },
            'MOTO_A_CAMINHO_COLETA': { label: 'Entregador vindo buscar', color: '#D35400', bg: '#FDF2E9' },
            'EM_ROTA_DEVOLUCAO': { label: 'Mala voltando à loja', color: '#A04000', bg: '#F6DDCC' },

            'FINALIZADA': { label: 'Finalizada', color: '#2C3E50', bg: '#EBEDEF' },
            'CANCELADA': { label: 'Cancelada', color: '#7F8C8D', bg: '#F2F4F4' },
        };

        return styles[key] || { label: status, color: '#7F8C8D', bg: '#F2F4F4' };
    };

    const currentStatus = getStatusStyle(bag.status?.toUpperCase());

    const copyToClipboard = (token: string) => {
        if (!token) return;
        Clipboard.setString(token);

        Toast.show({
            type: 'success',
            text1: 'Copiado!',
            text2: 'Código pronto para colar.',
            position: 'bottom'
        });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerCard}>
                <View style={[styles.statusBadge, { backgroundColor: currentStatus.bg }]}>
                    <Text style={[styles.statusText, { color: currentStatus.color }]}>
                        {currentStatus.label.toUpperCase()}
                    </Text>
                </View>

                <View style={[styles.typeBadge, { backgroundColor: bag.tipo === 'ABERTA' ? '#F5EEF8' : '#F2F4F4' }]}>
                    <Ionicons
                        name={bag.tipo === 'ABERTA' ? "bulb-outline" : "lock-closed-outline"}
                        size={14}
                        color={bag.tipo === 'ABERTA' ? '#9B59B6' : '#34495E'}
                    />
                    <Text style={[styles.typeText, { color: bag.tipo === 'ABERTA' ? '#9B59B6' : '#34495E' }]}>
                        MALA {bag.tipo}
                    </Text>
                </View>

                <Text style={styles.bagId}>Protocolo: #{bag.id.substring(0, 8).toUpperCase()}</Text>
            </View>

            {['EM_ROTA_ENTREGA', 'AGUARDANDO_MOTO_DEVOLUCAO', 'EM_ROTA_DEVOLUCAO'].includes(bag.status) && (
                <View style={styles.tokenCard}>
                    <Text style={styles.instructionText}>
                        {bag.status === 'EM_ROTA_ENTREGA' ? 'Mostre ao receber:' : 'Mostre ao devolver:'}
                    </Text>
                    <TouchableOpacity
                        onPress={() => copyToClipboard(bag.token_entrega || bag.token_devolucao)}
                        style={styles.codeBox}
                    >
                        <Text style={styles.tokenValue}>{bag.token_entrega || bag.token_devolucao}</Text>
                        <Ionicons name="copy-outline" size={24} color="#27AE60" />
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Resumo da Mala</Text>
                {bag.itens.map((item: any) => (
                    <View key={item.id} style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.variacao_produto.produto.nome}</Text>
                            {item.is_extra && (
                                <Text style={styles.extraTag}>Sugestão ✨</Text>
                            )}
                        </View>

                        <View style={[
                            styles.itemStatusBadge,
                            { backgroundColor: item.status_item === 'COMPRADO' ? '#EAFAF1' : '#FDEDEC' }
                        ]}>
                            <Text style={[
                                styles.itemStatusText,
                                { color: item.status_item === 'COMPRADO' ? '#27AE60' : '#E74C3C' }
                            ]}>
                                {item.status_item === 'COMPRADO' ? 'FICOU' : 'DEVOLVIDO'}
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA', padding: 20 },
    headerCard: {
        backgroundColor: '#FFF', borderRadius: 20, padding: 20,
        alignItems: 'center', marginBottom: 20, elevation: 2,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10
    },
    statusBadge: {
        paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, marginBottom: 10
    },
    statusText: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
    typeBadge: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
        paddingVertical: 4, borderRadius: 8, marginBottom: 10
    },
    typeText: { fontSize: 11, fontWeight: 'bold', marginLeft: 5 },
    bagId: { fontSize: 12, color: '#ADB5BD' },

    tokenCard: {
        backgroundColor: '#FFF', borderRadius: 20, padding: 20,
        alignItems: 'center', marginBottom: 20, borderStyle: 'dashed',
        borderWidth: 2, borderColor: '#D4EFDF'
    },
    instructionText: { fontSize: 14, color: '#27AE60', fontWeight: '600', marginBottom: 12 },
    codeBox: {
        flexDirection: 'row', backgroundColor: '#F1F9F4', padding: 15,
        borderRadius: 15, alignItems: 'center', justifyContent: 'center', width: '100%'
    },
    tokenValue: {
        fontSize: 36, fontWeight: 'bold', color: '#1A1A1A',
        letterSpacing: 6, marginRight: 15
    },

    section: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 40 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20 },
    itemRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F3F5'
    },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 15, color: '#333', fontWeight: '500' },
    extraTag: { fontSize: 11, color: '#9B59B6', fontWeight: 'bold', marginTop: 2 },
    itemStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    itemStatusText: { fontSize: 10, fontWeight: 'bold' }
});