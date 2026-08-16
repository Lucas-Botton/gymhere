import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Text from './Text';
import { colors, spacing } from '../../theme';

export default function ScreenHeader({
  title,
  onBack,
  right,
  transparent,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  transparent?: boolean;
}) {
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: transparent ? 'transparent' : '#fff' }}>
      <View style={styles.row}>
        <Pressable
          onPress={onBack ?? (() => router.back())}
          style={styles.backBtn}
          hitSlop={10}
        >
          <Text weight="black" style={{ fontSize: 18 }}>
            ‹
          </Text>
        </Pressable>
        <Text weight="black" style={{ fontSize: 17, flex: 1, textAlign: 'center', marginRight: 36 }} numberOfLines={1}>
          {title}
        </Text>
        {right ? <View style={styles.right}>{right}</View> : <View style={{ width: 36 }} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    minWidth: 36,
    alignItems: 'flex-end',
  },
});
