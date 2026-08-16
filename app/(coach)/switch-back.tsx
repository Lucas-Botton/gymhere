import React from 'react';
import { View } from 'react-native';

// Route intentionnellement vide : l'onglet "M'entraîner" intercepte l'appui
// (voir listeners.tabPress dans _layout.tsx) et bascule vers l'espace pratiquant
// sans jamais afficher cet écran.
export default function SwitchBackPlaceholder() {
  return <View />;
}
