import store from 'store';

export const TOKEN = 'accessToken';
export const USER_ROLE = 'userRole';

export default {
  get : (key : string) : any => {
    return store.get(key);
  },
  set : (key : string, value : any) : void => {
    return store.set(key, value);
  },
  remove : (key : string) : void => {
    return store.remove(key);
  }
}