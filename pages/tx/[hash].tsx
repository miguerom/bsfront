import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';

import type { Props } from 'lib/next/getServerSideProps';
import PageServer from 'lib/next/PageServer';

const Transaction = dynamic(() => import('ui/pages/Transaction'), { ssr: false });

const Page: NextPage<Props> = (props: Props) => {
  return (
    <PageServer pathname="/tx/[hash]" query={ props }>
      <Transaction/>
    </PageServer>
  );
};

export default Page;

export { base as getServerSideProps } from 'lib/next/getServerSideProps';
