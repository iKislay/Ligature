import mongoose, { Schema, model, models } from 'mongoose';

export interface IUser {
  username: string;
  encryptedAccessToken: string;
  accessTokenIv: string;
  accessTokenAuthTag: string;
  connectedAt: Date;
  lastUsedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    encryptedAccessToken: {
      type: String,
      required: true,
    },
    accessTokenIv: {
      type: String,
      required: true,
    },
    accessTokenAuthTag: {
      type: String,
      required: true,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export const User = models.User || model<IUser>('User', UserSchema);
