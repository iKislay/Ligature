import connectToDatabase from './mongodb';
import { User } from '@/models/User';
import { decryptToken, encryptToken } from './crypto';

export async function saveUserToken(username: string, accessToken: string) {
  await connectToDatabase();
  const encrypted = encryptToken(accessToken);

  await User.findOneAndUpdate(
    { username: username.toLowerCase() },
    {
      username: username.toLowerCase(),
      encryptedAccessToken: encrypted.encrypted,
      accessTokenIv: encrypted.iv,
      accessTokenAuthTag: encrypted.authTag,
      lastUsedAt: new Date(),
    },
    { upsert: true, new: true },
  );
}

export async function getUserToken(username: string): Promise<string | null> {
  await connectToDatabase();
  const user = await User.findOne({ username: username.toLowerCase() });
  if (!user) return null;

  try {
    const token = decryptToken({
      encrypted: user.encryptedAccessToken,
      iv: user.accessTokenIv,
      authTag: user.accessTokenAuthTag,
    });
    await User.updateOne(
      { username: username.toLowerCase() },
      { lastUsedAt: new Date() },
    );
    return token;
  } catch (error) {
    console.error('Failed to decrypt token for user:', username, error);
    return null;
  }
}

export async function deleteUserToken(username: string) {
  await connectToDatabase();
  await User.deleteOne({ username: username.toLowerCase() });
}
