import Exec from './exec';

export default class Echo extends Exec {
  constructor(id, msg) {
    super(id, `echo ${msg}`);
  }
}

