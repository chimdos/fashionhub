import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
    ActivityIndicator, Alert, SafeAreaView, StatusBar, Clipboard
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export const BagDetailsScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { bagId } = route.params;

    const [bag, setBag] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const BASE_URL = api.defaults.baseURL;

    useEffect(() => {
        fetchBagDetails();
    }, [bagId]);

    const fetchBagDetails = async () => {
        try {
            const response = await api.get(`/api/bags/${bagId}`);
            setBag(response.data);
        } catch (error: any) {
            Alert.alert("Erro", "Não foi possível carregar os detalhes.");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleCopyToken = (token: string) => {
        Clipboard.setString(token);
        Alert.alert("Copiado!", "Código copiado para facilitar a entrega.");
    };

    const getStatusInfo = (status: string) => {
        const map: any = {
            'SOLICITADA': { label: 'Aguardando Loja', color: '#E67E22', bg: '#FDEBD0' },
            'PREPARANDO': { label: 'Loja está separando', color: '#3498DB', bg: '#EBF5FB' },
            'AGUARDANDO_MOTO': { label: 'Buscando Entregador', color: '#9B59B6', bg: '#F5EEF8' },
            'EM_ROTA_ENTREGA': { label: 'A caminho de você', color: '#27AE60', bg: '#E9F7EF' },
            'ENTREGUE': { label: 'Finalizada', color: '#2C3E50', bg: '#ECF0F1' },
        };
        return map[status] || { label: status, color: '#7F8C8D', bg: '#F2F4F4' };
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    const status = getStatusInfo(bag.status);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Status da Entrega</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

                <View style={styles.statusCard}>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
                    </View>
                    <Text style={styles.bagId}>Protocolo: #{bag.id.substring(0, 8).toUpperCase()}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Seu Entregador</Text>
                    {bag.entregador ? (
                        <View style={styles.courierCard}>
                            <View style={[styles.courierThumb, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#E9F7EF' }]}>
                                <Ionicons name="person" size={28} color="#27AE60" />
                            </View>

                            <View style={styles.courierMeta}>
                                <Text style={styles.courierName}>{bag.entregador.nome}</Text>
                                <Text style={styles.courierSub}>Entregador Parceiro FashionHub</Text>
                            </View>

                            <View style={styles.expandTrigger}>
                                <Ionicons name="checkmark-circle" size={18} color="#27AE60" />
                                <Text style={[styles.expandText, { color: '#27AE60', marginLeft: 4 }]}>Identificado</Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.waitingCourier}>
                            <Ionicons name="time-outline" size={20} color="#999" />
                            <Text style={styles.waitingText}>Aguardando um entregador aceitar...</Text>
                        </View>
                    )}
                </View>

                {bag.status === 'EM_ROTA_ENTREGA' && (
                    <View style={styles.tokenSection}>
                        <Text style={styles.sectionTitle}>Segurança</Text>
                        <TouchableOpacity
                            style={styles.tokenContainer}
                            onPress={() => handleCopyToken(bag.token_entrega)}
                        >
                            <Text style={styles.tokenInstruction}>Mostre este código ao motoboy:</Text>
                            <View style={styles.tokenBox}>
                                <Text style={styles.tokenValue}>{bag.token_entrega}</Text>
                                <Ionicons name="copy-outline" size={20} color="#27AE60" />
                            </View>
                            <Text style={styles.tokenWarning}>⚠️ Não compartilhe este código por mensagem.</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Itens na Mala</Text>
                    {bag.itens?.map((item: any) => (
                        <View key={item.id} style={styles.itemMiniCard}>
                            <Image
                                source={{ uri: `${BASE_URL}${item.variacao_produto.produto.imagens[0]?.url_imagem}` }}
                                style={styles.itemImg}
                            />
                            <View style={styles.itemTextContent}>
                                <Text style={styles.itemName} numberOfLines={1}>{item.variacao_produto.produto.nome}</Text>
                                <Text style={styles.itemDetails}>{item.variacao_produto.tamanho} • {item.variacao_produto.cor}</Text>
                            </View>
                            <Text style={styles.itemPrice}>R$ {Number(item.preco_unitario_mala).toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F2F2F2'
    },
    backButton: { padding: 8, backgroundColor: '#F8F9FA', borderRadius: 12 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },

    content: { padding: 20 },
    statusCard: { alignItems: 'center', marginBottom: 30 },
    statusBadge: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20, marginBottom: 8 },
    statusLabel: { fontSize: 14, fontWeight: 'bold' },
    bagId: { fontSize: 12, color: '#999' },

    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 0.5 },

    courierCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 15, borderRadius: 18 },
    courierThumb: { width: 55, height: 55, borderRadius: 27, backgroundColor: '#DDD' },
    courierMeta: { flex: 1, marginLeft: 15 },
    courierName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    courierSub: { fontSize: 12, color: '#777', marginTop: 2 },
    expandTrigger: { flexDirection: 'row', alignItems: 'center' },
    expandText: { fontSize: 12, color: '#27AE60', fontWeight: 'bold', marginRight: 4 },

    waitingCourier: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 15, borderRadius: 18 },
    waitingText: { fontSize: 13, color: '#999', marginLeft: 10, fontStyle: 'italic' },

    tokenSection: { marginBottom: 30 },
    tokenContainer: { backgroundColor: '#E9F7EF', borderRadius: 20, padding: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: '#27AE60', alignItems: 'center' },
    tokenInstruction: { fontSize: 13, color: '#27AE60', marginBottom: 10 },
    tokenBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 25, paddingVertical: 10, borderRadius: 12 },
    tokenValue: { fontSize: 32, fontWeight: 'bold', color: '#1A1A1A', letterSpacing: 6, marginRight: 10 },
    tokenWarning: { fontSize: 10, color: '#27AE60', marginTop: 12, opacity: 0.8 },

    itemMiniCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#FFF', padding: 8, borderRadius: 12, borderWidth: 1, borderColor: '#F2F2F2' },
    itemImg: { width: 45, height: 45, borderRadius: 8, backgroundColor: '#F8F9FA' },
    itemTextContent: { flex: 1, marginLeft: 12 },
    itemName: { fontSize: 14, fontWeight: '600', color: '#333' },
    itemDetails: { fontSize: 11, color: '#999' },
    itemPrice: { fontSize: 14, fontWeight: 'bold', color: '#333' }
});