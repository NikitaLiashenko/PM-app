import storage, { TOKEN, USER_ROLE} from "@/stores/storage";
import {action, observable, runInAction} from "mobx";
import AuthService, {TokenRole} from '@/services/authService';

class AuthStore {
  @observable
  token : string = storage.get(TOKEN);

  @observable
  role : string = storage.get(USER_ROLE);

  @observable
  isLoading : boolean = false;

  @action
  authorize = async(email : string, password : string) => {
    this.isLoading = true;

    let response;
    try {
      response = await AuthService.authorize(email, password);
    } catch(responseError){
      runInAction(() => {
        this.isLoading = false;
      });

      return Promise.reject(responseError.response);
    }

    runInAction(() => {
      this.isLoading = false;
    });

    this.setTokenAndRole({
      token : response.token,
      role : response.role
    });

    return Promise.resolve(response.role);
  };

  @action
  setTokenAndRole = (tokenAndRole : TokenRole) => {
    this.token = tokenAndRole.token;
    this.role = tokenAndRole.role;

    storage.set(TOKEN, tokenAndRole.token);
    storage.set(USER_ROLE, tokenAndRole.token);
  };

  @action
  logout = () => {
    this.token = '';
    this.role = '';

    storage.remove(TOKEN);
    storage.remove(USER_ROLE);

    window.location.href = '/';
  };
}

export default AuthStore