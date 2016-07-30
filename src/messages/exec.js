import Message from './message';

export default class Exec extends Message {
  constructor(id, body) {
    super(id, 2, body);
  }
}

