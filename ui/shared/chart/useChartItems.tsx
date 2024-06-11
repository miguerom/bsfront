import React from 'react';

import type { StatsIntervalIds } from 'types/client/stats';

import useApiQuery from 'lib/api/useApiQuery';
import { STATS_INTERVALS } from 'ui/stats/constants';

import formatDate from './utils/formatIntervalDate';

export default function useChartItems(interval: StatsIntervalIds, id: string, enabled = true) {
  const selectedInterval = STATS_INTERVALS[interval];

  const endDate = selectedInterval.start ? formatDate(new Date()) : undefined;
  const startDate = selectedInterval.start ? formatDate(selectedInterval.start) : undefined;

  const lineQuery = useApiQuery('stats_line', {
    pathParams: { id },
    queryParams: {
      from: startDate,
      to: endDate,
    },
    queryOptions: {
      enabled: enabled,
      refetchOnMount: false,
    },
  });

  const items = React.useMemo(() => lineQuery.data?.chart?.map((item) => {
    return { date: new Date(item.date), value: Number(item.value) };
  }), [ lineQuery ]);

  return {
    items,
    lineQuery,
  };
}
