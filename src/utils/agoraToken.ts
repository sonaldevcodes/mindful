import { RtcTokenBuilder, RtcRole } from 'agora-token';
// import * as dotenv from 'dotenv';

// dotenv.config();

export function generateToken(channelName: string, uid: string, role: 'publisher' | 'audience' = 'publisher', expiry: number = 31536000): string {
  // const currentTime = Math.floor(Date.now() / 1000);
  // const privilegeExpireTime = currentTime + expiry;
  const APP_ID = process.env.AGORA_APP_ID as string;
  const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE as string;
  const channelNameForToekn = channelName?.toString()

  if (!APP_ID || !APP_CERTIFICATE) {
    console.log('Agora APP_ID or APP_CERTIFICATE is missing in environment variables.');
    return ''
  } else {
    let rtcRole: number;
    if (role === 'publisher') {
      rtcRole = RtcRole.PUBLISHER;
    } else if (role === 'audience') {
      rtcRole = RtcRole.SUBSCRIBER;
    } else {
      throw new Error('Invalid role');
    }

    // TO DO use uid for eatch users for now just use 0 insted of uid in buildTokenWithUid function
    const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelNameForToekn, 0, rtcRole, expiry, 0);

    // Log the token expiry time in a human-readable format
    // const expiryDate = new Date(privilegeExpireTime * 1000); // Convert UNIX timestamp to milliseconds
    // console.log(`Token generated with expiry date: ${expiryDate.toUTCString()}`);

    return token;
  }

}
