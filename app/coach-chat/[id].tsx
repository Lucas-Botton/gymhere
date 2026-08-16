import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Text from '../../src/components/ui/Text';
import ScreenHeader from '../../src/components/ui/ScreenHeader';
import { Avatar } from '../../src/components/ui/primitives';
import { colors, radius, spacing } from '../../src/theme';
import { useApp } from '../../src/store/app';

export default function CoachChat() {
  const { id, name, avatar } = useLocalSearchParams<{ id: string; name: string; avatar: string }>();
  const ensureThread = useApp((s) => s.ensureThread);
  const sendMessage = useApp((s) => s.sendMessage);
  const thread = useApp((s) => s.threads[id ?? '']);
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (id) {
      ensureThread(id, {
        name: name ?? 'Pratiquant',
        avatarBg: avatar ?? 'pinkViolet',
        role: 'Pratiquant',
        messages: [{ from: 'them', text: 'Merci d’avoir accepté ma demande !', time: '09:00' }],
      });
    }
  }, [id]);

  const send = () => {
    if (!text.trim() || !id) return;
    sendMessage(id, text.trim());
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title={name ?? 'Conversation'} onBack={() => router.replace('/(coach)/demandes')} />
      <FlatList
        ref={listRef}
        data={thread?.messages ?? []}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: spacing.lg }}
        renderItem={({ item }) => (
          <View style={[styles.bubbleRow, item.from === 'me' && { justifyContent: 'flex-end' }]}>
            {item.from === 'them' ? <Avatar size={28} gradient={avatar ?? 'pinkViolet'} initial={(name ?? 'P')[0]} /> : null}
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
          placeholder="Écris ta réponse..."
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
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, height: 44, borderRadius: radius.pill, backgroundColor: colors.bgTint, paddingHorizontal: spacing.md, fontFamily: 'Nunito_600SemiBold', fontSize: 13.5, color: colors.ink },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.pink, alignItems: 'center', justifyContent: 'center' },
});
