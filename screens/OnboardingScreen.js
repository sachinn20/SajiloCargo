// screens/OnboardingScreen.js
import React, { useRef, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, Dimensions, Image, TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const BRAND_COLOR = '#004aad';

const slides = [
  {
    key: '1',
    title: 'Quick Delivery At Your Doorstep',
    description: 'Enjoy quick pick-up and delivery to your destination.',
    image: require('../assets/onboarding1.png'),
  },
  {
    key: '2',
    title: 'Flexible Payment',
    description: 'Different modes of payment before and after delivery without stress.',
    image: require('../assets/onboarding2.png'),
  },
  {
    key: '3',
    title: 'Real-time Tracking',
    description: 'Track your packages/items from pickup to final delivery.',
    image: require('../assets/onboarding3.png'),
  }
];

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await AsyncStorage.setItem('onboardingSeen', 'true');
      navigation.replace('Login');
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboardingSeen', 'true');
    navigation.replace('Login');
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, currentIndex === i && styles.activeDot]} />
          ))}
        </View>

        <TouchableOpacity style={styles.fullButton} onPress={handleNext}>
          <Text style={styles.fullButtonText}>
            {currentIndex === slides.length - 1 ? 'Sign Up' : 'Next'}
          </Text>
        </TouchableOpacity>

        {currentIndex < slides.length - 1 && (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skip}>
              Already have an account? <Text style={styles.skipLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 60
  },
  image: {
    width: width * 0.9,
    height: height * 0.5,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: BRAND_COLOR,
    textAlign: 'center',
    marginBottom: 10
  },
  description: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  dots: {
    flexDirection: 'row',
    marginVertical: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: BRAND_COLOR,
    width: 12,
    height: 12,
  },
  fullButton: {
    backgroundColor: BRAND_COLOR,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  fullButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  skip: {
    marginTop: 15,
    color: '#777',
    fontSize: 13,
  },
  skipLink: {
    color: BRAND_COLOR,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default OnboardingScreen;
