import Constants from 'expo-constants';

const {
  BUNNY_STORAGE_ZONE,
  BUNNY_STORAGE_API_KEY,
  BUNNY_STREAM_LIBRARY_ID,
  BUNNY_STREAM_API_KEY,
} = Constants.expoConfig.extra || process.env;

export async function uploadImageBunny(fileUri, storagePath) {
  const blob = await fetch(fileUri).then((r) => r.blob());
  const endpoint = `https://${BUNNY_STORAGE_ZONE}.storage.bunnycdn.com/${storagePath}/${Date.now()}`;
  const res = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      AccessKey: BUNNY_STORAGE_API_KEY,
      'Content-Type': blob.type,
    },
    body: blob,
  });
  if (!res.ok) {
    throw new Error('Bunny image upload failed');
  }
  return `https://${BUNNY_STORAGE_ZONE}.b-cdn.net/${storagePath}/${Date.now()}`;
}

export async function createVideoMeta({ Title, Description }) {
  const res = await fetch(
    `https://video.bunnycdn.com/library/${BUNNY_STREAM_LIBRARY_ID}/videos`,
    {
      method: 'POST',
      headers: {
        accessKey: BUNNY_STREAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Title, Description }),
    }
  );
  if (!res.ok) {
    throw new Error('Bunny video meta create failed');
  }
  return res.json(); // { Id, UploadUrl, ... }
}

export async function uploadVideoBunny(uploadUrl, fileUri) {
  const blob = await fetch(fileUri).then((r) => r.blob());
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': blob.type },
    body: blob,
  });
  if (!res.ok) {
    throw new Error('Bunny video upload failed');
  }
}

export async function getPlaybackUrlBunny(videoId) {
  const res = await fetch(
    `https://video.bunnycdn.com/library/${BUNNY_STREAM_LIBRARY_ID}/videos/${videoId}`,
    { headers: { AccessKey: BUNNY_STREAM_API_KEY } }
  );
  if (!res.ok) {
    throw new Error('Bunny get playback URL failed');
  }
  const data = await res.json();
  return data.Url || data.playbackUrl;
} 
