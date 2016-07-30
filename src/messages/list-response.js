import Response from './response';

export default class ListResponse extends Response {
  get users() {
    if (!this.body || this.body.length == 0)
      return [];

    return this.body.split('\n').map(u => {
      const [clientId, username, uuid] = u.split(' : ');
      return {clientId, username, uuid};
    });
  }
}

