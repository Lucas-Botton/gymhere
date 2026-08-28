import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Text from '../../src/components/ui/Text';
import ScreenHeader from '../../src/components/ui/ScreenHeader';
import { Avatar } from '../../src/components/ui/primitives';
import { colors, radius, spacing } from '../../src/theme';
import { useApp } from '../../src/store/app';
import { useSession } from '../../src/store/session';
import { useFindCoach } from '../../src/lib/coaches';
import { threadIdFor, fetchThreadMessages, subscribeToThread } from '../../src/lib/messagesRepo';

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const coach = useFindCoach(id);
  const myUserId = useSession((s) => s.user?.id) ?? 'me';
  const ensureThread = useApp((s) => s.ensureThread);
  const sendMessage = useApp((s) => s.sendMessage);
  const threadId = id ? threadIdFor(myUserId, id) : '';
  const thread = useApp((s) => s.threads[threadId]);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!coach || !id) return;
    ensureThread(threadId, { name: coach.name, avatarBg: coach.photo, role: `Coach · ${coach.specs[0] ?? ''}`, messages: [] });
    fetchThreadMessages(threadId, myUserId).then((msgs) => {
      if (msgs) useApp.getState().hydrateThread(threadId, msgs);
    });
    const unsubscribe = subscribeToThread(threadId, myUserId, (msg) => {
      if (msg.from === 'them') useApp.getState().receiveMessage(threadId, msg);
    });
    return unsubscribe;
  }, [id]);

  if (!coach) return null;

  const goBack = () => router.back();

  const send = () => {
    if (!text.trim() || !threadId) return;
    sendMessage(threadId, text.trim());
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title={coach.name} onBack={goBack} />
      <FlatList
        ref={listRef}
        data={thread?.messages ?? []}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item }) => (
          <View style={[styles.bubbleRow, item.from === 'me' && { justifyContent: 'flex-end' }]}>
            {item.from === 'them' ? <Avatar size={28} gradient={coach.photo} initial={coach.name[0]} uri={coach.photoUri} /> : null}
            <View style={[styles.bubble, item.from === 'me' ? styles.bubbleMe : styles.bubbleThem]}>
              <Text weight="semibold" color={item.from === 'me' ? '#fff' : colors.ink} style={{ fontSize: 13.5 }}>
                {item.text}
              </Text>
            </View>
          </View>
        )}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />
      <View style={styles.inputBar}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Écris ton message..."
          placeholderTextColor={colors.textLight}
          style={styles.input}
          onSubmitEditing={send}
        />
        <Pressable onPress={send} style={styles.sendBtn}>
          <Text weight="black" color="#fff" style={{ fontSize: 13 }}>
            →
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: spacing.sm },
  bubble: { maxWidth: '75%', borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleThem: { backgroundColor: colors.bgTint },
  bubbleMe: { backgroundColor: colors.pink },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.bgTint,
    paddingHorizontal: spacing.md,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13.5,
    color: colors.ink,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center' },
});
