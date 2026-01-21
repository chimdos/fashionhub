import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, SafeAreaView,
    TouchableOpacity, Linking, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <TouchableOpacity style={styles.faqCard} onPress={toggleExpand} activeOpacity={0.7}>
            <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{question}</Text>
                <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#ADB5BD"
                />
            </View>
            {expanded && <Text style={styles.faqAnswer}>{answer}</Text>}
        </TouchableOpacity>
    );
};

export const HelpCenterScreen = ({ navigation }: any) => {
    const openWhatsApp = () => {
        const message = "Olá! Sou lojista na FashionHub e preciso de ajuda.";
        const phone = "5515999999999";
        Linking.openURL(`whatsapp://send?phone=${phone}&text=${message}`);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Central de Ajuda</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.sectionTitle}>Suporte Direto</Text>
                <View style={styles.supportRow}>
                    <TouchableOpacity style={styles.supportBtn} onPress={openWhatsApp}>
                        <View style={[styles.iconCircle, { backgroundColor: '#EFFFF4' }]}>
                            <Ionicons name="logo-whatsapp" size={24} color="#28a745" />
                        </View>
                        <Text style={styles.supportBtnText}>WhatsApp</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.supportBtn} onPress={() => Linking.openURL('mailto:suporte@fashionhub.com')}>
                        <View style={[styles.iconCircle, { backgroundColor: '#F0F7FF' }]}>
                            <Ionicons name="mail-outline" size={24} color="#007AFF" />
                        </View>
                        <Text style={styles.supportBtnText}>E-mail</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Dúvidas Comuns</Text>
                <FAQItem
                    question="Como funcionam as entregas em Sorocaba?"
                    answer="As entregas são feitas via motoboy parceiro em até 24h para toda a região central e bairros próximos."
                />
                <FAQItem
                    question="Como alterar o preço de um produto?"
                    answer="Basta ir em 'Meus Produtos', selecionar o item desejado e clicar no ícone de editar no canto superior direito."
                />
                <FAQItem
                    question="Posso cadastrar variações de cor e tamanho?"
                    answer="Sim! Na tela de cadastro ou edição, clique no ícone '+' na seção de variações para adicionar novas combinações."
                />

                <View style={styles.footer}>
                    <TouchableOpacity onPress={() => { }}>
                        <Text style={styles.footerLink}>Termos de Uso</Text>
                    </TouchableOpacity>
                    <Text style={styles.versionText}>FashionHub v1.0.4</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFF',
        borderBottomWidth: 1, borderBottomColor: '#EEE'
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    container: { padding: 20 },
    sectionTitle: {
        fontSize: 14, fontWeight: 'bold', color: '#ADB5BD',
        marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1
    },
    supportRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    supportBtn: {
        backgroundColor: '#FFF', width: '48%', padding: 20, borderRadius: 20,
        alignItems: 'center', elevation: 3, shadowColor: '#000',
        shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }
    },
    iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    supportBtnText: { fontSize: 14, fontWeight: 'bold', color: '#333' },

    faqCard: {
        backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 12,
        borderWidth: 1, borderColor: '#F1F3F5'
    },
    faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    faqQuestion: { fontSize: 15, fontWeight: '600', color: '#333', flex: 1, marginRight: 10 },
    faqAnswer: { fontSize: 14, color: '#666', marginTop: 15, lineHeight: 20 },

    footer: { marginTop: 40, alignItems: 'center', paddingBottom: 20 },
    footerLink: { color: '#007AFF', fontSize: 14, marginBottom: 10 },
    versionText: { color: '#ADB5BD', fontSize: 12 }
});