import * as ImagePicker from 'expo-image-picker';

// Shared by every "pick a profile photo" entry point (member profile,
// coach presentation). Returns the picked image's local URI, or null if
// permission was refused or the picker was cancelled — callers just no-op
// on null rather than showing an error, since cancelling isn't a failure.
export async function pickProfilePhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (result.canceled || result.assets.length === 0) return null;
  return result.assets[0].uri;
}
