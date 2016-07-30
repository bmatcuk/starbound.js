import Response from './response';

export default class AuthResponse extends Response {
  get authSuccessful() { return this.id >= 0; }
}

