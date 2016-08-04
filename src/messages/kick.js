import Exec from './exec';

export default class Kick extends Exec {
  constructor(id, user, reason) {
    super(id, `kick ${user} ${reason}`);
  }
}

