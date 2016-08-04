import Exec from './exec';

export default class WhereIs extends Exec {
  constructor(id, user) {
    super(id, `whereis ${user}`);
  }
}

