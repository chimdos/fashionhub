import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const WelcomeScreen = ({ navigation }: any) => {
    return (
        <ImageBackground
            source={require('../../assets/background_fashion.jpg')}
            style={styles.background}
        >
            <SafeAreaView style={styles.overlay}>

                <View style={{ flex: 1 }} />

                <View style={styles.contentCard}>

                    <View style={styles.neumorphicWrapperBlue}>
                        <TouchableOpacity
                            style={styles.buttonBlue}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.buttonTextBlue}>JÁ TENHO UMA CONTA</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.neumorphicWrapperGray}>
                        <TouchableOpacity
                            style={styles.buttonGray}
                            onPress={() => navigation.navigate('Register')}
                        >
                            <Text style={styles.buttonTextGray}>CRIAR UMA CONTA</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.socialTitle}>Acessar com</Text>
                    <View style={styles.socialRow}>
                        <TouchableOpacity style={styles.socialIcon}>
                            <Ionicons name="logo-google" size={32} color="#DB4437" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialIcon}>
                            <Ionicons name="logo-apple" size={32} color="#000" />
                        </TouchableOpacity>
                    </View>

                </View>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    contentCard: {
        backgroundColor: '#E0E0E0',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 30,
        alignItems: 'center',
        paddingBottom: 50,
    },
    neumorphicWrapperBlue: {
        width: '100%',
        borderRadius: 25,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    buttonBlue: {
        backgroundColor: '#5DADE2',
        paddingVertical: 18,
        borderRadius: 25,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    buttonTextBlue: {
        color: '#004080',
        fontWeight: 'bold',
        fontSize: 16,
    },
    neumorphicWrapperGray: {
        width: '100%',
        borderRadius: 25,
        marginBottom: 30,
        shadowColor: "#000",
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    buttonGray: {
        backgroundColor: '#E0E0E0',
        paddingVertical: 18,
        borderRadius: 25,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    buttonTextGray: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 16,
    },
    socialTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    socialRow: {
        flexDirection: 'row',
        gap: 30,
    },
    socialIcon: {
        backgroundColor: '#E0E0E0',
        padding: 10,
        borderRadius: 50,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    }
});