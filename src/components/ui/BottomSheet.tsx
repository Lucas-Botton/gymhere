import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Pressable, Animated, StyleSheet, Dimensions, Keyboard, Platform, EmitterSubscription } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      translateY.setValue(SCREEN_H);
      backdrop.setValue(0);
      keyboardOffset.setValue(0);
      setKeyboardHeight(0);
    }
  }, [visible]);

  // KeyboardAvoidingView is unreliable inside a transparent RN <Modal> on iOS,
  // so track keyboard height manually and shift the sheet up ourselves. The
  // sheet's maxHeight must shrink by the same amount the sheet is translated
  // up, otherwise a tall sheet gets pushed off the TOP of the screen (its
  // header/first fields end up above the visible area) instead of just
  // clearing the keyboard at the bottom.
  useEffect(() => {
    if (!visible) return;
    let subShow: EmitterSubscription;
    let subHide: EmitterSubscription;
    if (Platform.OS === 'ios') {
      subShow = Keyboard.addListener('keyboardWillShow', (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        Animated.timing(keyboardOffset, {
          toValue: -e.endCoordinates.height,
          duration: e.duration || 250,
          useNativeDriver: true,
        }).start();
      });
      subHide = Keyboard.addListener('keyboardWillHide', (e) => {
        setKeyboardHeight(0);
        Animated.timing(keyboardOffset, { toValue: 0, duration: e.duration || 250, useNativeDriver: true }).start();
      });
    } else {
      subShow = Keyboard.addListener('keyboardDidShow', (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        Animated.timing(keyboardOffset, { toValue: -e.endCoordinates.height, duration: 150, useNativeDriver: true }).start();
      });
      subHide = Keyboard.addListener('keyboardDidHide', () => {
        setKeyboardHeight(0);
        Animated.timing(keyboardOffset, { toValue: 0, duration: 150, useNativeDriver: true }).start();
      });
    }
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [visible]);

  const handleClose = () => {
    Keyboard.dismiss();
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
            {
              maxHeight: Math.max(280, SCREEN_H * maxHeightRatio - keyboardHeight),
              transform: [{ translateY }, { translateY: keyboardOffset }],
            },
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
          <View style={{ flexShrink: 1, paddingBottom: insets.bottom }}>
            {children}
          </View>
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
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
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
