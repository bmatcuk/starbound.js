import Exec from './exec';

export default class ServerReload extends Exec {
  constructor(id) {
    super(id, 'serverreload');
  }
}

