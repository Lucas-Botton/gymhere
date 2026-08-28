import React, { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { colors } from '../../src/theme';
import { IconCard, IconInbox, IconStar, IconBack } from '../../src/components/ui/icons';
import { useSession } from '../../src/store/session';
import { useApp } from '../../src/store/app';
import { fetchIncomingCoachBookings } from '../../src/lib/bookingsRepo';

export default function CoachTabsLayout() {
  const backToMember = useSession((s) => s.backToMember);
  const userId = useSession((s) => s.user?.id);
  const setIncomingBookings = useApp((s) => s.setIncomingBookings);
  const newRequests = useApp((s) => s.incomingBookings.filter((b) => b.status === 'en_attente').length);

  // Refetched every time the coach opens their space (not just at app
  // boot), so a request that came in while they were on the member side
  // shows up without needing a full app restart.
  useEffect(() => {
    if (!userId) return;
    fetchIncomingCoachBookings(userId).then((bookings) => {
      if (bookings) setIncomingBookings(bookings);
    });
  }, [userId, setIncomingBookings]);

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
        name="ma-fiche"
        options={{ title: 'Ma fiche', tabBarIcon: ({ color }) => <IconCard color={color as string} size={23} /> }}
      />
      <Tabs.Screen
        name="demandes"
        options={{
          title: 'Demandes',
          tabBarIcon: ({ color }) => <IconInbox color={color as string} size={23} />,
          tabBarBadge: newRequests > 0 ? newRequests : undefined,
        }}
      />
      <Tabs.Screen
        name="avis"
        options={{ title: 'Avis', tabBarIcon: ({ color }) => <IconStar color={color as string} size={22} /> }}
      />
      <Tabs.Screen
        name="switch-back"
        options={{ title: 'M’entraîner', tabBarIcon: ({ color }) => <IconBack color={color as string} size={22} /> }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            backToMember();
            router.replace('/(member)/explore');
          },
        }}
      />
    </Tabs>
  );
}
