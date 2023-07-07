import type { StyleProps } from '@chakra-ui/react';
import { Flex, chakra, Skeleton, Box, shouldForwardProp } from '@chakra-ui/react';
import React from 'react';

import type { TokenInfo } from 'types/api/token';

import AddressLink from 'ui/shared/address/AddressLink';
import TokenLogo from 'ui/shared/TokenLogo';
import TruncatedTextTooltip from 'ui/shared/TruncatedTextTooltip';

interface Props {
  data?: Pick<TokenInfo, 'address' | 'icon_url' | 'name' | 'symbol'>;
  className?: string;
  logoSize?: number;
  isDisabled?: boolean;
  isLoading?: boolean;
  hideSymbol?: boolean;
  hideIcon?: boolean;
  maxW: StyleProps['maxW'];
}

const TokenSnippet = ({ data, className, logoSize = 6, isDisabled, hideSymbol, hideIcon, isLoading, maxW }: Props) => {

  const withSymbol = data && data.symbol && !hideSymbol;

  return (
    <Flex className={ className } alignItems="center" columnGap={ 2 } w="100%" overflow="hidden">
      { !hideIcon && <TokenLogo boxSize={ logoSize } data={ data } isLoading={ isLoading }/> }
      <AddressLink
        flexShrink={ 0 }
        hash={ data?.address || '' }
        alias={ data?.name || 'Unnamed token' }
        type="token"
        isDisabled={ isDisabled }
        isLoading={ isLoading }
        maxW={ withSymbol ? `calc(80% - ${ logoSize * 4 + 8 * 2 }px)` : `calc(${ maxW || '100%' } - ${ logoSize * 4 + 8 }px)` }
        overflow="hidden"
        textOverflow="ellipsis"
      />
      { withSymbol && (
        <Skeleton isLoaded={ !isLoading } color="text_secondary" maxW="20%" display="flex">
          <div>(</div>
          <TruncatedTextTooltip label={ data.symbol || '' }>
            <Box overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" wordBreak="break-all">{ data.symbol }</Box>
          </TruncatedTextTooltip>
          <div>)</div>
        </Skeleton>
      ) }
    </Flex>
  );
};

export default chakra(TokenSnippet, {
  shouldForwardProp: (prop) => {
    const isChakraProp = !shouldForwardProp(prop);

    if (isChakraProp && prop !== 'maxW') {
      return false;
    }

    return true;
  },
});
