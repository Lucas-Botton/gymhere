import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import Text from '../../src/components/ui/Text';
import CoachDetailView from '../../src/components/coach/CoachDetailView';
import { useFindCoach } from '../../src/lib/coaches';

export default function CoachDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const coach = useFindCoach(id);

  if (!coach) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text weight="bold">Coach introuvable.</Text>
      </SafeAreaView>
    );
  }

  return <CoachDetailView coach={coach} />;
}
