import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';

import PageServer from 'lib/next/PageServer';

const Accounts = dynamic(() => import('ui/pages/Accounts'), { ssr: false });

const Page: NextPage = () => {
  return (
    <PageServer pathname="/accounts">
      <Accounts/>
    </PageServer>
  );
};

export default Page;

export { base as getServerSideProps } from 'lib/next/getServerSideProps';
