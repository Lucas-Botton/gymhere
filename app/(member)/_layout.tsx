import React from 'react';
import { Tabs } from 'expo-router';
import { colors } from '../../src/theme';
import { IconExplore, IconCoach, IconHeart, IconProfile } from '../../src/components/ui/icons';

export default function MemberTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.pink,
        tabBarInactiveTintColor: colors.textLight,
        tabBarLabelStyle: { fontFamily: 'Nunito_800ExtraBold', fontSize: 10.5 },
        tabBarStyle: { height: 82, paddingTop: 8, paddingBottom: 22, backgroundColor: '#fff', borderTopColor: '#F2EDF4' },
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorer',
          tabBarIcon: ({ color }) => <IconExplore color={color as string} size={23} />,
        }}
      />
      <Tabs.Screen
        name="coaches"
        options={{ title: 'Coachs', tabBarIcon: ({ color }) => <IconCoach color={color as string} size={23} /> }}
      />
      <Tabs.Screen
        name="favorites"
        options={{ title: 'Favoris', tabBarIcon: ({ color }) => <IconHeart color={color as string} size={22} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profil', tabBarIcon: ({ color }) => <IconProfile color={color as string} size={23} /> }}
      />
    </Tabs>
  );
}
