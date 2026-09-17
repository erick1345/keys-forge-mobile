// Configuracao do Metro (empacotador). Usa o padrao do Expo, que ja inclui
// a integracao do expo-router (define a pasta raiz das rotas).
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
