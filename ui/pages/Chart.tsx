// ChartWidgetContainer

import { Button, Flex, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';

import type { StatsIntervalIds } from 'types/client/stats';

import throwOnResourceLoadError from 'lib/errors/throwOnResourceLoadError';
import getQueryParamString from 'lib/router/getQueryParamString';
import isCustomAppError from 'ui/shared/AppError/isCustomAppError';
import ChartIntervalSelect from 'ui/shared/chart/ChartIntervalSelect';
import ChartMenu from 'ui/shared/chart/ChartMenu';
import ChartWidgetContent from 'ui/shared/chart/ChartWidgetContent';
import useChartItems from 'ui/shared/chart/useChartItems';
import useZoomReset from 'ui/shared/chart/useZoomReset';
import IconSvg from 'ui/shared/IconSvg';
import PageTitle from 'ui/shared/Page/PageTitle';

const Chart = () => {
  const router = useRouter();
  const id = getQueryParamString(router.query.id);
  const [ interval, setInterval ] = React.useState<StatsIntervalIds>('oneMonth');
  const { isZoomResetInitial, handleZoom, handleZoomResetClick } = useZoomReset();

  const ref = React.useRef(null);

  const { items, lineQuery } = useChartItems(interval, id);

  if (lineQuery.isError) {
    if (isCustomAppError(lineQuery.error)) {
      throwOnResourceLoadError({ resource: 'stats_line', error: lineQuery.error, isError: true });
    }
  }

  const hasItems = (items && items.length > 2) || lineQuery.isPending;

  const content = (
    <>
      <Flex alignItems="center" justifyContent="space-between">
        <Flex alignItems="center">
          <Text mr={ 2 }>Zoom</Text>
          <ChartIntervalSelect interval={ interval } onIntervalChange={ setInterval }/>
          { !isZoomResetInitial && (
            <Button
              leftIcon={ <IconSvg name="repeat_arrow" w={ 4 } h={ 4 }/> }
              colorScheme="blue"
              gridColumn={ 2 }
              justifySelf="end"
              alignSelf="top"
              gridRow="1/3"
              size="sm"
              variant="outline"
              onClick={ handleZoomResetClick }
              ml={ 6 }
            >
                Reset zoom
            </Button>
          ) }
        </Flex>
        { hasItems && (
          <Flex alignItems="center">
            { /* share */ }
            <ChartMenu items={ items } title="FIXME" isLoading={ lineQuery.isPending } chartRef={ ref }/>
          </Flex>
        ) }
      </Flex>
      <Flex
        ref={ ref }
        flexGrow={ 1 }
        h="50vh"
        mt={ 3 }
      >
        <ChartWidgetContent
          isError={ lineQuery.isError }
          items={ items }
          title="title"
          // title={ chart.title }
          // units={ chart.units || undefined }
          isEnlarged
          isLoading={ lineQuery.isPending }
          isZoomResetInitial={ isZoomResetInitial }
          handleZoom={ handleZoom }
        />
      </Flex>
    </>
  );

  return (
    <>
      <PageTitle
        title="FIXME"
        // withTextAd
      />
      { content }
    </>
  );
};

export default Chart;
