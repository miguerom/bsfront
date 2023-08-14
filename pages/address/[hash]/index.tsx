import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';

import type { Props } from 'lib/next/getServerSideProps';
import PageServer from 'lib/next/PageServer';

const Address = dynamic(() => import('ui/pages/Address'), { ssr: false });

const Page: NextPage<Props> = (props: Props) => {
  return (
    <PageServer pathname="/address/[hash]" query={ props }>
      <Address/>
    </PageServer>
  );
};

export default Page;

export { base as getServerSideProps } from 'lib/next/getServerSideProps';
