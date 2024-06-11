import { chakra } from '@chakra-ui/react';
import React, { useEffect } from 'react';

import type { StatsIntervalIds } from 'types/client/stats';

import useChartItems from 'ui/shared/chart/useChartItems';

import ChartWidget from '../shared/chart/ChartWidget';

type Props = {
  id: string;
  title: string;
  description: string;
  units?: string;
  interval: StatsIntervalIds;
  onLoadingError: () => void;
  isPlaceholderData: boolean;
  className?: string;
}

const ChartWidgetContainer = ({ id, title, description, interval, onLoadingError, units, isPlaceholderData, className }: Props) => {
  const { items, lineQuery } = useChartItems(interval, id, !isPlaceholderData);

  useEffect(() => {
    if (lineQuery.isError) {
      onLoadingError();
    }
  }, [ lineQuery.isError, onLoadingError ]);

  return (
    <ChartWidget
      isError={ lineQuery.isError }
      items={ items }
      title={ title }
      units={ units }
      description={ description }
      isLoading={ lineQuery.isPending }
      minH="230px"
      className={ className }
    />
  );
};

export default chakra(ChartWidgetContainer);
