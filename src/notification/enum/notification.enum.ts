export enum NotificationTypeEnum {
    AUTH = 'auth',
    USERS = 'users',
    QUESTIONS = 'questions',
    ACTIVITIES = 'activities',
    MEDIA = 'media',
    MATCHES = 'matches',
    FAVORITES = 'favorites',
    ACTIVITY_LOGS = 'activity logs',
    ACTIVITY_START = 'activity_start',
    ACTIVITY_END = 'activity_end',
    CALL = 'call'  // TO-DO 
  }

export const ALLOWED_ACTIVITY_TYPES = ['Video Call', 'Voice Call', 'Text Messaging'];