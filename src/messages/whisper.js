import Exec from './exec';

export default class Whisper extends Exec {
  constructor(id, username, message) {
    super(id, `say /w ${username} ${message}`);
  }
}

