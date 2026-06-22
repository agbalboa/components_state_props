import { View, Text, StyleSheet, ImageBackground, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import CustomButton from './CustomButton';
import { useFonts } from 'expo-font';
import { Audio } from 'expo-av';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import ConfettiCannon from 'react-native-confetti-cannon';

// return image (emoticons) based on happiness level
const getFaceImage = (happiness: number) => {
  if (happiness >= 80) return require('../assets/images/very-happy.png');
  if (happiness >= 60) return require('../assets/images/happy.png');
  if (happiness >= 40) return require('../assets/images/neutral.png');
  if (happiness >= 20) return require('../assets/images/cry.png');
  return require('../assets/images/angry.png');
};

// component that displays the image
const HappinessFace = ({ happiness }: { happiness: number }) => {
  // scale value for the animated image. start at normal scale (1)
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevHappiness = useRef(happiness);

  useEffect(() => {
    // spring bounce effect when happiness changes
    if (prevHappiness.current !== happiness) {
      prevHappiness.current = happiness;

      Animated.spring(scaleAnim, {
        toValue: 1.3,
        useNativeDriver: true,
        speed: 20,
        bounciness: 18,
      }).start(() => {
        // scale back to normal size (1)
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 10,
        }).start();
      });
    }
  }, [happiness]);

  return (
    <View style={styles.faceContainer}>
      <Animated.Image
        source={getFaceImage(happiness)}
        style={[styles.faceImage, { transform: [{ scale: scaleAnim }] }]}
      />
    </View>
  );
};

// change color on meter based on happiness level
const getMeterColor = (happiness: number): string => {
  if (happiness >= 70) return '#68b893';
  if (happiness >= 40) return '#f5c24c';
  return '#ff7c69';
};

export default function HomeScreen() {
  // state variables
  const [happiness, setHappiness] = useState(50);
  const [sound, setSound] = useState<InstanceType<typeof Audio.Sound> | null>(null);

  // confetti
  const confettiRef = useRef<any>(null);

  // font
  const [fontsLoaded] = useFonts({
    'CustomFont-Regular': require('../assets/fonts/humming.otf'),
  });

  // play sound
  async function playSound(soundFile: any) {
    if (sound) {
      await sound.unloadAsync();
    }
    const { sound: newSound } = await Audio.Sound.createAsync(soundFile);
    setSound(newSound);
    await newSound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);

  // long press
  const timerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const isLongPressRef = useRef(false);

  const startContinuous = (action: () => void) => {
    isLongPressRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      intervalRef.current = setInterval(() => {
        action();
      }, 150);
    }, 500);
  };

  const stopContinuous = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handlePress = (action: () => void) => {
    if (!isLongPressRef.current) {
      action();
    }
  };

  useEffect(() => {
    return () => {
      stopContinuous();
    };
  }, []);

  // increase happiness level by 10 + sound
  const addHappiness = async () => {
    await playSound(require('../assets/sounds/happy.wav'));
    setHappiness((prev) => {
      const next = prev + 10;

      // confetti trigger if happiness level = 100
      if (next === 100 && prev !== 100) {
        setTimeout(() => confettiRef.current?.start(), 100);
      }

      return next;
    });
  };

  // decrease happiness level by 10 + sound
  const decreaseHappiness = async () => {
    await playSound(require('../assets/sounds/sad.wav'));
    setHappiness((prev) => prev - 10);
  };

  // reset
  const resetHappiness = async () => {
    await playSound(require('../assets/sounds/reset.wav'));
    setHappiness(100);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../assets/images/background.jpg')}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.parentContainer}>
          <Text style={styles.title}>Happiness Meter</Text>

          <HappinessFace happiness={happiness} />

          <Text style={styles.meterText}>Level: {happiness} / 100</Text>

          <View style={styles.meterContainer}>
            {/* width of fill bar = happiness percentage */}
            <View style={[
              styles.meterFill,
              {
                width: `${Math.max(0, happiness)}%`,
                backgroundColor: getMeterColor(happiness)
              }]} />
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              title="Happy"
              onPress={() => handlePress(addHappiness)}
              onPressIn={() => startContinuous(addHappiness)}
              onPressOut={stopContinuous}
              variant="add"
              icon={<FontAwesome5 name="smile" size={20} color="white" />}
            />
            <CustomButton
              title="Sad"
              onPress={() => handlePress(decreaseHappiness)}
              onPressIn={() => startContinuous(decreaseHappiness)}
              onPressOut={stopContinuous}
              variant="decrease"
              icon={<FontAwesome5 name="sad-cry" size={20} color="white" />}
            />
            <CustomButton title="Reset" onPress={resetHappiness} variant="reset" />
          </View>
        </View>

        {/* chat bubble image */}
        <ImageBackground
          source={require('../assets/images/bubble.png')}
          style={styles.footerContainer}
          imageStyle={styles.footerImageStyle}
        >
          <Text style={styles.footerText}>How happy are you today?</Text>
        </ImageBackground>

        {/* confetti element*/}
        <ConfettiCannon
          ref={confettiRef}
          count={150}
          origin={{ x: 175, y: 0 }}
          autoStart={false}
          fadeOut={true}
          explosionSpeed={350}
          fallSpeed={3000}
          colors={['#68b893', '#f5c24c', '#ff7c69', '#786951', '#fff9e5', '#a78bfa']}
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parentContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff9e5',
    borderRadius: 20,
    width: 350,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#786951',
    textAlign: 'center',
    fontFamily: 'CustomFont-Regular',
    lineHeight: 40,
  },
  faceContainer: {
    marginVertical: 20,
  },
  faceImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  meterText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    marginBottom: 15,
    fontFamily: 'CustomFont-Regular',
  },
  meterContainer: {
    width: '100%',
    height: 20,
    backgroundColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 30,
  },
  meterFill: {
    height: '100%',
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  footerContainer: {
    width: '100%',
    height: 150,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  footerImageStyle: {
    resizeMode: 'cover',
    borderRadius: 10,
  },
  footerText: {
    fontFamily: 'CustomFont-Regular',
    fontSize: 17,
    color: '#786951',
    textAlign: 'center',
    lineHeight: 40,
  },
});
