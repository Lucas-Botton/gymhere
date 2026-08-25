import * as ImagePicker from 'expo-image-picker';
import { supabase, isSupabaseConfigured } from './supabase';

const PHOTOS_BUCKET = 'photos'; // see README: the Storage bucket created during Supabase setup

// Shared by every "pick a profile photo" entry point (member profile,
// coach presentation). Returns the picked image's URI, or null if
// permission was refused or the picker was cancelled — callers just no-op
// on null rather than showing an error, since cancelling isn't a failure.
//
// When Supabase is configured, the picked image is uploaded to the
// `photos` Storage bucket under `folder/` and the returned URI is the
// real public URL (visible to every user/device); otherwise (or if the
// upload fails) the local file URI is returned as before, so the picker
// itself never breaks even without a bucket set up yet.
export async function pickProfilePhoto(folder: string = 'avatars'): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (result.canceled || result.assets.length === 0) return null;
  const localUri = result.assets[0].uri;

  const publicUrl = await uploadToStorage(localUri, folder);
  return publicUrl ?? localUri;
}

async function uploadToStorage(localUri: string, folder: string): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const ext = localUri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const response = await fetch(localUri);
    const blob = await response.blob();
    const { error } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, blob, {
      contentType: blob.type || `image/${ext}`,
      upsert: true,
    });
    if (error) return null;
    const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch {
    return null;
  }
}
