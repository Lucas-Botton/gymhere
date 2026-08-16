import React, { useEffect, useRef } from 'react';
import { Modal, View, Pressable, Animated, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, shadow } from '../../theme';
import Text from './Text';

const { height: SCREEN_H } = Dimensions.get('window');

export default function BottomSheet({
  visible,
  onClose,
  children,
  title,
  maxHeightRatio = 0.9,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxHeightRatio?: number;
}) {
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      translateY.setValue(SCREEN_H);
      backdrop.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: SCREEN_H, duration: 220, useNativeDriver: true }),
      Animated.timing(backdrop, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose} statusBarTranslucent>
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(20,16,26,0.5)', opacity: backdrop }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            shadow.sheet,
            { maxHeight: SCREEN_H * maxHeightRatio, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.grabber} />
          {title ? (
            <View style={styles.header}>
              <Text weight="black" style={{ fontSize: 17 }}>
                {title}
              </Text>
              <Pressable onPress={handleClose} style={styles.closeBtn}>
                <Text weight="black" color={colors.textMuted}>
                  ✕
                </Text>
              </Pressable>
            </View>
          ) : null}
          <SafeAreaView edges={['bottom']}>{children}</SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.bgTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
