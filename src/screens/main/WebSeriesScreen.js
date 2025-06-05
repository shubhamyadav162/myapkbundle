import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Image, Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../../theme';
import { useNavigation } from '@react-navigation/native';

const WebSeriesScreen = () => {
  const navigation = useNavigation();
  // Static list of all web series images
  const imageSources = [
    require('../../../assets/webimages/img_1061_64a3b9e62e1b8_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64a3f3bcb454c_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64c246faa4621_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f58df62ef08_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f5941204ac8_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f6cc07b7a46_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f6cd2450c2a_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f6cef9bdbe4_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f6d02dac262_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f6d052762df_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f6d09a0d2a0_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f6d2f130b4c_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f6d4f999c10_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f6d51dd6a64_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f6d581a1712_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f6d752e274c_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f6d7dc73d95_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f6d88d98a23_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f6d9ec2eae7_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f6da5305d4d_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f6df1a9be46_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f6ebfbe911a_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f6ecc1d886b_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f6ed0695325_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f6f1cdd3083_360x540.jpg'),
    require('../../../assets/webimages/img_1061_64f72eca2f58c_360x540.jpg'),
    require('../../../assets/webimages/img_1061_65019c476e705_360x540.jpg'),
    require('../../../assets/webimages/img_1061_654cef036357a_360x540.jpg'),
    require('../../../assets/webimages/img_1061_65d4a2f39950d_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6634cb908f5f3_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6634cc5cf1af9_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6634cd093d1c7_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6634e3c18d056_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6634e45c07ebe_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6635e68f0a878_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66e15d04e435b_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66ea980862b5b_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66ead44f6482d_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66ec21365e94c_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66f16ce2028f9_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66f17aad4a4b8_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66f2aff3d901d_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66f2b06279c94_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66f2b10c61640_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66f2d2eb4dd9b_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66f3dc52398ba_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66f3fbedbc6b6_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66f6b7ffdbca3_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66fa910b94e7f_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66fabc9f4d36e_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66fabd21643be_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66fe4de4bfb58_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66fe781f5954e_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66ffded584b89_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66ffdf678257b_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66ffdf96e31de_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66ffdfe3435d1_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66ffe08dd5d85_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66ffe45675fcd_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66ffee9c30476_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66fff0cf81232_360x540.jpg'),
    require('../../../assets/webimages/img_1061_66fff529de29b_360x540.jpg'),
    require('../../../assets/webimages/img_1061_67039a427d5b8_360x540.jpg'),
    require('../../../assets/webimages/img_1061_67039f37baaa9_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6703a7cf145b4_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6703f6c055827_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6703fb655bf88_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6703fd08e50e4_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6703fd8dc906b_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6704ccce32d9f_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6704ccf67e658_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6704cd0aedcd1_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6704cd331e0b3_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6704f26d33d1d_360x540.jpg'),
    require('../../../assets/webimages/img_1061_67050b2d4e179_360x540.jpg'),
    require('../../../assets/webimages/img_1061_670625996d786_360x540.jpg'),
    require('../../../assets/webimages/img_1061_670661bce8184_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6706a204a6e58_360x540.jpg'),
    require('../../../assets/webimages/img_1061_670d0e8221cd6_360x540.jpg'),
    require('../../../assets/webimages/img_1061_670d11ce59e2c_360x540.jpg'),
    require('../../../assets/webimages/img_1061_670d12837aa28_360x540.jpg'),
    require('../../../assets/webimages/img_1061_670d138c3f0ff_360x540.jpg'),
    require('../../../assets/webimages/img_1061_670d1512a5ade_360x540.jpg'),
    require('../../../assets/webimages/img_1061_67286a7099ad6_360x540.jpg'),
    require('../../../assets/webimages/img_1061_67286eb41bbea_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6728c49c4ce08_360x540.jpg'),
    require('../../../assets/webimages/img_1061_672a3aae30f39_360x540.jpg'),
    require('../../../assets/webimages/img_1061_673484509f734_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6736f0d0acc73_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6736f1bfce3c1_360x540.jpg'),
    require('../../../assets/webimages/img_1061_67441bb9cc079_360x540.jpg'),
    require('../../../assets/webimages/img_1061_67441d8755838_360x540.jpg'),
    require('../../../assets/webimages/img_1061_67441e4ecc917_360x540.jpg'),
    require('../../../assets/webimages/img_1061_67442249992ab_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6744235f0c24c_360x540.jpg'),
    require('../../../assets/webimages/img_1061_674425bad10d8_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6744270103e3a_360x540.jpg'),
    require('../../../assets/webimages/img_1061_674428fccd9b5_360x540.jpg'),
    require('../../../assets/webimages/img_1061_67442eebbc2e2_360x540.jpg'),
    require('../../../assets/webimages/img_1061_674430190198e_360x540.jpg'),
    require('../../../assets/webimages/img_1061_67486a5f1f143_360x540.jpg'),
    require('../../../assets/webimages/img_1061_675d5c2598c30_360x540.jpg'),
    require('../../../assets/webimages/img_1061_67642f72bd946_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6777ac73d17d9_360x540.jpg'),
    require('../../../assets/webimages/img_1061_677fea3db9914_360x540.jpg'),
    require('../../../assets/webimages/img_1061_678f462875558_360x540.jpg'),
    require('../../../assets/webimages/img_1061_679386c40573e_360x540.jpg'),
    require('../../../assets/webimages/img_1061_6794bed5bb870_360x540.jpg'),
    require('../../../assets/webimages/img_1061_679cfa202078a_360x540.jpg'),
    require('../../../assets/webimages/img_1061_67a4f041084f6_360x540.jpg'),
    require('../../../assets/webimages/img_1061_67ac8cd2c5090_360x540.jpg'),
    require('../../../assets/webimages/img_1061_67adfc85ca6f9_360x540.jpg'),
    require('../../../assets/webimages/img_1061_67b97f50e333c_360x540.jpg'),
    require('../../../assets/webimages/img_1061_67c060ec76f68_360x540.jpg'),
    require('../../../assets/webimages/img_1061_67c06bafb4e5a_360x540.jpg'),
    require('../../../assets/webimages/img_1061_67d2d1b59b56f_360x540.jpg'),
    require('../../../assets/webimages/img_1061_67f680bb60817_360x540.jpg'),
    require('../../../assets/webimages/img_1061_67f6811c8386f_360x540.jpg'),
    require('../../../assets/webimages/img_1061_680114e0b20e6_360x540.jpg'),
    require('../../../assets/webimages/img_1061_680672c788e12_360x540.jpg'),
    require('../../../assets/webimages/img_1061_680a4c7de6bbd_360x540.jpg'),
  ];
  const seriesNames = [
    'Sacred Games', 'Mirzapur', 'Paatal Lok', 'Delhi Crime', 'Scam 1992',
    'The Family Man', 'Made in Heaven', 'Inside Edge', 'Breathe', 'Bard of Blood',
    'Criminal Justice', 'Kota Factory', 'Aarya', 'Tandav', 'Grahan',
    'Asur', 'Hostages', 'Special Ops', 'The Test Case', 'Four More Shots',
  ];
  const data = imageSources.map((src, index) => ({
    id: index.toString(),
    source: src,
    title: seriesNames[index % seriesNames.length],
  }));

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('WebSeriesDetail', {
        source: item.source,
        id: item.id,
        title: item.title,
        year: 2023,
        episodes: 10,
        rating: 8.5,
        description: 'Demo description for ' + item.title,
      })}>
        <Image source={item.source} style={styles.thumbnail} />
      </TouchableOpacity>
      <Text style={styles.title}>{item.title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={[ 'top' ]}>
      <StatusBar translucent={false} backgroundColor={theme.colors.primary} barStyle="light-content" />
      <View style={styles.container}>
        <FlatList
          data={data}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    margin: theme.spacing.small / 2,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: theme.borderRadius.medium,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    marginTop: theme.spacing.small / 2,
    textAlign: 'center',
    fontSize: 14,
    color: theme.colors.text,
  },
});

export default WebSeriesScreen; 
