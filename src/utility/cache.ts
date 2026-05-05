import NodeCache from 'node-cache';

// stdTTL: 24 jam (86400 detik)
// checkperiod: 1 jam untuk pembersihan berkala
export const authCache = new NodeCache({
  stdTTL: 86400,
  checkperiod: 3600,
  useClones: false,
});
