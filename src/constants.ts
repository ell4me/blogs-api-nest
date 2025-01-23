// In seconds
export const EXPIRATION_TOKEN = {
  ACCESS: 600,
  REFRESH: 1200,
};

export const ROUTERS_PATH = {
  BLOGS: 'blogs',
  POSTS: 'posts',
  TESTING: 'testing',
  USERS: 'users',
  AUTH: 'auth',
  COMMENTS: 'comments',
  SECURITY_DEVICES: 'security/devices',
};

export const VALIDATION_MESSAGES = {
  FIELD_EMPTY: 'Field must be not empty',
  FIELD_IS_NOT_URL: 'It`s not an url',
  BLOG_IS_NOT_EXIST: 'Blog with current id doesn`t exist',
  FIELD_RANGE: 'Field must be to have value in range from 1 to 18',
  AVAILABLE_RESOLUTIONS:
    'Field must include at least one of this value and nothing else: P144, P240, P360, P480, P720, P1080, P1440, P2160',
  FIELD_IS_EXIST: (field: string) =>
    `User with current ${field} is already exist`,
  USER_IS_NOT_FOUND: 'User with that email is not found',
  CODE_IS_NOT_CORRECT: (nameCode?: string) => `${nameCode} code is not correct`,
  CODE_EXPIRED: (nameCode?: string) => `${nameCode} code has already expired`,
  USER_ALREADY_CONFIRMED: 'User has already confirmed',
  LIKE_STATUS: 'Like status is not correct',
};

export enum STATUSES_LIKE {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}
