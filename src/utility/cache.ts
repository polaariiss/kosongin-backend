import NodeCache from 'node-cache';

// stdTTL: 1 jam (3600 detik)
// checkperiod: 10 menit (600 detik) untuk pembersihan lebih sering
export const authCache = new NodeCache({
  stdTTL: 3600,
  checkperiod: 600,
  useClones: false,
});
