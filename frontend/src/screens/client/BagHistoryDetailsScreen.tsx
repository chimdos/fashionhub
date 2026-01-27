import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Clipboard, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const BagHistoryDetailsScreen = ({ route }: any) => {
    const { bag } = route.params;

    const copyToClipboard = (token: string) => {
        Clipboard.setString(token);
        Alert.alert("Copiado!", "Código copiado para a área de transferência.");
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.tokenCard}>
                <Text style={styles.tokenLabel}>STATUS: {bag.status}</Text>

                {['EM_ROTA_ENTREGA', 'AGUARDANDO_COLETA'].includes(bag.status) && (
                    <View style={styles.tokenContainer}>
                        <Text style={styles.instructionText}>Mostre este código ao entregador:</Text>
                        <TouchableOpacity
                            onPress={() => copyToClipboard(bag.token_entrega || bag.token_devolucao)}
                            style={styles.codeBox}
                        >
                            <Text style={styles.tokenValue}>{bag.token_entrega || bag.token_devolucao}</Text>
                            <Ionicons name="copy-outline" size={20} color="#4CAF50" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Resumo da Mala</Text>
                {bag.itens.map((item: any) => (
                    <View key={item.id} style={styles.itemRow}>
                        <Text style={styles.itemName}>{item.variacao_produto.produto.nome}</Text>
                        <Text style={[styles.itemStatus, { color: item.comprado ? '#4CAF50' : '#F44336' }]}>
                            {item.comprado ? 'COMPRADO' : 'DEVOLVIDO'}
                        </Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
    tokenCard: {
        backgroundColor: '#FFF', borderRadius: 16, padding: 20,
        alignItems: 'center', elevation: 4, marginBottom: 20
    },
    tokenLabel: { fontSize: 12, fontWeight: 'bold', color: '#999', marginBottom: 10 },
    tokenContainer: { alignItems: 'center', width: '100%' },
    instructionText: { fontSize: 14, color: '#333', marginBottom: 12 },
    codeBox: {
        flexDirection: 'row', backgroundColor: '#E8F5E9', padding: 15,
        borderRadius: 12, borderWidth: 2, borderColor: '#4CAF50',
        alignItems: 'center', justifyContent: 'center', width: '100%'
    },
    tokenValue: {
        fontSize: 32, fontWeight: 'bold', color: '#1B5E20',
        letterSpacing: 5, marginRight: 10
    },
    section: { backgroundColor: '#FFF', borderRadius: 16, padding: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
    itemRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEE'
    },
    itemName: { fontSize: 14, color: '#333' },
    itemStatus: { fontSize: 12, fontWeight: 'bold' }
});