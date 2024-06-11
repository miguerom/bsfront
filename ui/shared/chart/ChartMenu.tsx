import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  useColorModeValue,
  VisuallyHidden,
} from '@chakra-ui/react';
import domToImage from 'dom-to-image';
import React from 'react';

import type { TimeChartItem } from './types';

import dayjs from 'lib/date/dayjs';
import saveAsCSV from 'lib/saveAsCSV';
import IconSvg from 'ui/shared/IconSvg';

import FullscreenChartModal from './FullscreenChartModal';

export type Props = {
  items?: Array<TimeChartItem>;
  title: string;
  description?: string;
  units?: string;
  isLoading: boolean;
  chartRef: React.RefObject<HTMLDivElement>;
}

const DOWNLOAD_IMAGE_SCALE = 5;

const ChartMenu = ({ items, title, description, units, isLoading, chartRef }: Props) => {
  const pngBackgroundColor = useColorModeValue('white', 'black');
  const [ isFullscreen, setIsFullscreen ] = React.useState(false);

  const showChartFullscreen = React.useCallback(() => {
    setIsFullscreen(true);
  }, []);

  const clearFullscreenChart = React.useCallback(() => {
    setIsFullscreen(false);
  }, []);

  const handleFileSaveClick = React.useCallback(() => {
    // wait for context menu to close
    setTimeout(() => {
      if (chartRef.current) {
        domToImage.toPng(chartRef.current,
          {
            quality: 100,
            bgcolor: pngBackgroundColor,
            width: chartRef.current.offsetWidth * DOWNLOAD_IMAGE_SCALE,
            height: chartRef.current.offsetHeight * DOWNLOAD_IMAGE_SCALE,
            filter: (node) => node.nodeName !== 'BUTTON',
            style: {
              borderColor: 'transparent',
              transform: `scale(${ DOWNLOAD_IMAGE_SCALE })`,
              'transform-origin': 'top left',
            },
          })
          .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = `${ title } (Blockscout chart).png`;
            link.href = dataUrl;
            link.click();
            link.remove();
          });
      }
    }, 100);
  }, [ pngBackgroundColor, title, chartRef ]);

  const handleSVGSavingClick = React.useCallback(() => {
    if (items) {
      const headerRows = [
        'Date', 'Value',
      ];
      const dataRows = items.map((item) => [
        dayjs(item.date).format('YYYY-MM-DD'), String(item.value),
      ]);

      saveAsCSV(headerRows, dataRows, `${ title } (Blockscout stats)`);
    }
  }, [ items, title ]);

  return (
    <>
      <Menu>
        <Skeleton isLoaded={ !isLoading } borderRadius="base">
          <MenuButton
            w="36px"
            h="32px"
            icon={ <IconSvg name="dots" boxSize={ 4 } transform="rotate(-90deg)"/> }
            colorScheme="gray"
            variant="ghost"
            as={ IconButton }
          >
            <VisuallyHidden>
            Open chart options menu
            </VisuallyHidden>
          </MenuButton>
        </Skeleton>
        <MenuList>
          <MenuItem
            display="flex"
            alignItems="center"
            onClick={ showChartFullscreen }
          >
            <IconSvg name="scope" boxSize={ 5 } mr={ 3 }/>
            View fullscreen
          </MenuItem>

          <MenuItem
            display="flex"
            alignItems="center"
            onClick={ handleFileSaveClick }
          >
            <IconSvg name="files/image" boxSize={ 5 } mr={ 3 }/>
            Save as PNG
          </MenuItem>

          <MenuItem
            display="flex"
            alignItems="center"
            onClick={ handleSVGSavingClick }
          >
            <IconSvg name="files/csv" boxSize={ 5 } mr={ 3 }/>
            Save as CSV
          </MenuItem>
        </MenuList>
      </Menu>
      { items && (
        <FullscreenChartModal
          isOpen={ isFullscreen }
          items={ items }
          title={ title }
          description={ description }
          onClose={ clearFullscreenChart }
          units={ units }
        />
      ) }
    </>
  );
};

export default ChartMenu;
