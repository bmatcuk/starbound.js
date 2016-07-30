import Message from './message';

export default class Auth extends Message {
  constructor(id, password) {
    super(id, 3, password);
  }
}

