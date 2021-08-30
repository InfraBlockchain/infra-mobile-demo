require('node-libs-expo/globals');
import * as encoding from 'text-encoding';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import InfraDID from 'infra-did-js'
import {decodeJWT} from 'did-jwt';
import * as Random from 'expo-random';
import * as Clipboard from 'expo-clipboard';

export default function App() {

  const [identity, setIdentity] = React.useState({});
  const [jwt, setSignedJwt] = React.useState('');
  const [decodedData, setDecodedData] = React.useState({});

  // Set infra-did-js config
  const confBlockchainNetwork = {
    networkId: '01',
    registryContract: 'infradidregi',
    rpcEndpoint: 'https://api.testnet.infrablockchain.com',
  }

  const createSignedJWT = async () => {
    // Create did (public & private key pair)
    const identity = InfraDID.createPubKeyDIDsecp256k1('01');
    setIdentity(identity);

    // Set Signer config
    const conf = {
      ...confBlockchainNetwork,
      did: `${identity.did}`,
      didOwnerPrivateKey: `${identity.privateKey}`,
    }
    const didApi = new InfraDID(conf);

    // Given challenge value
    const challenge = Random.getRandomBytes(1)[0];

    // Set payload of signedJWT
    const payload = {
      nonce: challenge,
      payload: {
        company: 'moca',
      }
    }

    //Sign JWT
    const jwt = await didApi.signJWT(payload);
    const decodedJWT = decodeJWT(jwt).payload;
    setSignedJwt(jwt);
    setDecodedData(decodedJWT);
    console.log('identity>\n', identity);
    console.log('\n');
    console.log('jwt>\n', jwt);
    console.log('\n');
    console.log('decoded>\n', decodedJWT);

    Clipboard.setString(jwt);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text>Blockchain Labs</Text>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>DID</Text>
        <Text style={styles.subtitle}>{identity.did && `did:\n${identity.did}`}</Text>
        <Text style={styles.subtitle}>{identity.privateKey && `privateKey:\n${identity.privateKey}`}</Text>
        <Text style={styles.subtitle}>{identity.publicKey && `publicKey:\n${identity.publicKey}`}</Text>
        <Text style={styles.title}>SignedJWT</Text>
        <Text style={styles.subtitle}>{jwt && `${jwt}`}</Text>
        <Text style={styles.title}>DecodedJWT</Text>
        <Text style={styles.subtitle}>{decodedData && `${JSON.stringify(decodedData)}`}</Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={createSignedJWT}>
          <Text style={styles.buttonText}>{`생성하기 & JWT 클립보드 복사`}</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  contentContainer: {
    width: Dimensions.get('window').width * .8,
    // height: Dimensions.get('window').height * .7,
    borderWidth: 1,
    borderColor: 'black',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 12,
  },
  footer: {
    height: 50,
  },
  button: {
    width: Dimensions.get('window').width * .8,
    height: 50,
    backgroundColor: '#0036AF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
