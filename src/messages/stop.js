import Exec from './exec';

export default class Stop extends Exec {
  constructor(id) {
    super(id, 'stop');
  }
}

