import Exec from './exec';

export default class Broadcast extends Exec {
  constructor(id, msg) {
    super(id, `broadcast ${msg}`);
  }
}

