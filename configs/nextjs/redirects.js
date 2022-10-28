const PATHS = require('../../lib/link/paths');
const BASE_PATH = process.env.NEXT_PUBLIC_APP_BASE_PATH === '__PLACEHOLDER_FOR_NEXT_PUBLIC_APP_BASE_PATH__' ?
  '' :
  (process.env.NEXT_PUBLIC_APP_BASE_PATH || '');

const oldUrls = [
  {
    oldPath: '/account/tag_transaction',
    newPath: `${ PATHS.private_tags }?tab=tx`,
  },
  {
    oldPath: '/pending-transactions',
    newPath: `${ PATHS.txs }?tab=pending`,
  },
  {
    oldPath: '/tx/:id/internal-transactions',
    newPath: `${ PATHS.tx }?tab=internal`,
  },
  {
    oldPath: '/tx/:id/logs',
    newPath: `${ PATHS.tx }?tab=logs`,
  },
  {
    oldPath: '/tx/:id/raw-trace',
    newPath: `${ PATHS.tx }?tab=raw_trace`,
  },
  {
    oldPath: '/tx/:id/state',
    newPath: `${ PATHS.tx }?tab=state`,
  },
  {
    oldPath: '/uncles',
    newPath: `${ PATHS.blocks }?tab=uncles`,
  },
  {
    oldPath: '/reorgs',
    newPath: `${ PATHS.blocks }?tab=reorgs`,
  },
  {
    oldPath: '/block/:id/transactions',
    newPath: `${ PATHS.block }?tab=txs`,
  },
];

async function redirects() {
  return [
    ...oldUrls.map(item => {
      const source = BASE_PATH + item.oldPath;
      const destination = BASE_PATH + item.newPath;
      return { source, destination, permanent: false };
    }),
  ];
}

module.exports = redirects;
