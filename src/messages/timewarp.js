import Exec from './exec';

export default class Timewarp extends Exec {
  constructor(id, amount) {
    super(id, `timewarp ${amount}`);
  }
}

