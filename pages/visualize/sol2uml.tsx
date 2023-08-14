import type { NextPage } from 'next';
import React from 'react';

import PageServer from 'lib/next/PageServer';
import Sol2Uml from 'ui/pages/Sol2Uml';

const Page: NextPage = () => {
  return (
    <PageServer pathname="/visualize/sol2uml">
      <Sol2Uml/>
    </PageServer>
  );
};

export default Page;

export { base as getServerSideProps } from 'lib/next/getServerSideProps';
