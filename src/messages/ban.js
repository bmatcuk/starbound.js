import Exec from './exec';

export default class Ban extends Exec {
  constructor(id, user, time, reason) {
    super(id, `ban ${user} ${reason} ${time ? time : ''}`);
  }
}

