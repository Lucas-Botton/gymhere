import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Text from '../ui/Text';
import Button from '../ui/Button';
import { useSession } from '../../store/session';
import { colors, spacing } from '../../theme';

export default function AuthSheet() {
  const { authOpen, authActionLabel, closeAuth, login } = useSession();
  const [name, setName] = useState('');

  return (
    <BottomSheet visible={authOpen} onClose={closeAuth}>
      <View style={styles.wrap}>
        <Text weight="black" style={{ fontSize: 20, textAlign: 'center' }}>
          Crée ton compte
        </Text>
        <Text weight="semibold" color={colors.textMuted} style={{ fontSize: 14, textAlign: 'center', marginTop: 6 }}>
          {authActionLabel ? `Pour ${authActionLabel}, connecte-toi en quelques secondes.` : 'Connecte-toi pour continuer.'}
        </Text>

        <View style={{ height: spacing.xl }} />
        <Button label="Continuer avec Google" variant="outline" onPress={() => login({ name: 'Alex' })} />
        <View style={{ height: spacing.sm }} />
        <Button label="Continuer avec Apple" variant="dark" onPress={() => login({ name: 'Alex' })} />
        <View style={{ height: spacing.sm }} />
        <Button label="Continuer avec e-mail" variant="primary" onPress={() => login({ name: name || 'Alex' })} />

        <Text weight="semibold" color={colors.textLight} style={{ fontSize: 11, textAlign: 'center', marginTop: spacing.lg }}>
          En continuant, tu acceptes les CGU et la politique de confidentialité de gymhere.
        </Text>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, paddingTop: spacing.sm },
});
