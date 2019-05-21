/* Sanitization Subprovider
 * For Parity compatibility
 * removes irregular keys
 */
import { JSONRPCRequest } from '../provider-engine';
import { addHexPrefix } from '../util/eth-util';
import Subprovider from './subprovider';

export default class SanitizerSubprovider extends Subprovider {

  public handleRequest(
    payload: JSONRPCRequest,
    next: (cb?) => void,
    end: (error: Error | null, result?: any) => void,
  ) {
    const txParams = payload.params[0];

    if (typeof txParams === 'object' && !Array.isArray(txParams)) {
      const sanitized = cloneTxParams(txParams);
      payload.params[0] = sanitized;
    }

    next();
  }
}

// we use this to clean any custom params from the txParams
const permitted = [
  'from',
  'to',
  'value',
  'data',
  'gas',
  'gasPrice',
  'nonce',
  'fromBlock',
  'toBlock',
  'address',
  'topics',
];

function cloneTxParams(txParams) {
  const sanitized = permitted.reduce((copy, p) => {
    if (p in txParams) {
      if (Array.isArray(txParams[p])) {
        copy[p] = txParams[p].map((item) => sanitize(item));
      } else {
        copy[p] = sanitize(txParams[p]);
      }
    }
    return copy;
  }, {});

  return sanitized;
}

function sanitize(value) {
  switch (value) {
    case 'latest':
      return value;
    case 'pending':
      return value;
    case 'earliest':
      return value;
    default:
      if (typeof value === 'string') {
        return addHexPrefix(value.toLowerCase());
      } else {
        return value;
      }
  }
}
