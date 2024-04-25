import { Box, Flex, Tooltip } from '@chakra-ui/react';
import type { UseQueryResult } from '@tanstack/react-query';
import React from 'react';

import type { Address } from 'types/api/address';
import type { TokenInfo } from 'types/api/token';

import config from 'configs/app';
import type { ResourceError } from 'lib/api/resources';
import useApiQuery from 'lib/api/useApiQuery';
import { useAppContext } from 'lib/contexts/app';
import AddressQrCode from 'ui/address/details/AddressQrCode';
import AccountActionsMenu from 'ui/shared/AccountActionsMenu/AccountActionsMenu';
import AddressAddToWallet from 'ui/shared/address/AddressAddToWallet';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import * as TokenEntity from 'ui/shared/entities/token/TokenEntity';
import EntityTags from 'ui/shared/EntityTags';
import IconSvg from 'ui/shared/IconSvg';
import NetworkExplorers from 'ui/shared/NetworkExplorers';
import PageTitle from 'ui/shared/Page/PageTitle';

import TokenVerifiedInfo from './TokenVerifiedInfo';

interface Props {
  tokenQuery: UseQueryResult<TokenInfo, ResourceError<unknown>>;
  addressQuery: UseQueryResult<Address, ResourceError<unknown>>;
  isLoading?: boolean;
}

const TokenPageTitle = ({ tokenQuery, addressQuery, isLoading }: Props) => {
  const appProps = useAppContext();
  const addressHash = !tokenQuery.isPlaceholderData ? (tokenQuery.data?.address || '') : '';

  const verifiedInfoQuery = useApiQuery('token_verified_info', {
    pathParams: { hash: addressHash, chainId: config.chain.id },
    queryOptions: { enabled: Boolean(tokenQuery.data) && !tokenQuery.isPlaceholderData && config.features.verifiedTokens.isEnabled },
  });

  const tokenSymbolText = tokenQuery.data?.symbol ? ` (${ tokenQuery.data.symbol })` : '';

  const backLink = React.useMemo(() => {
    const hasGoBackLink = appProps.referrer && appProps.referrer.includes('/tokens');

    if (!hasGoBackLink) {
      return;
    }

    return {
      label: 'Back to tokens list',
      url: appProps.referrer,
    };
  }, [ appProps.referrer ]);

  const contentAfter = (
    <>
      { verifiedInfoQuery.data?.tokenAddress && (
        <Tooltip label={ `Information on this token has been verified by ${ config.chain.name }` }>
          <Box boxSize={ 6 }>
            <IconSvg name="verified_token" color="green.500" boxSize={ 6 } cursor="pointer"/>
          </Box>
        </Tooltip>
      ) }
      <EntityTags
        data={ addressQuery.data }
        isLoading={ tokenQuery.isPlaceholderData || addressQuery.isPlaceholderData }
        tagsBefore={ [
          tokenQuery.data ? { label: tokenQuery.data?.type, display_name: tokenQuery.data?.type } : undefined,
          config.features.bridgedTokens.isEnabled && tokenQuery.data?.is_bridged ?
            { label: 'bridged', display_name: 'Bridged', colorScheme: 'blue', variant: 'solid' } :
            undefined,
        ] }
        tagsAfter={
          verifiedInfoQuery.data?.projectSector ?
            [ { label: verifiedInfoQuery.data.projectSector, display_name: verifiedInfoQuery.data.projectSector } ] :
            undefined
        }
        flexGrow={ 1 }
      />
    </>
  );

  const secondRow = (
    <Flex alignItems="center" w="100%" minW={ 0 } columnGap={ 2 } rowGap={ 2 } flexWrap={{ base: 'wrap', lg: 'nowrap' }}>
      <AddressEntity
        address={{ ...addressQuery.data, name: '' }}
        isLoading={ isLoading }
        fontFamily="heading"
        fontSize="lg"
        fontWeight={ 500 }
      />
      { !isLoading && tokenQuery.data && <AddressAddToWallet token={ tokenQuery.data } variant="button"/> }
      <AddressQrCode address={ addressQuery.data } isLoading={ isLoading }/>
      <AccountActionsMenu isLoading={ isLoading }/>
      <Flex ml={{ base: 0, lg: 'auto' }} columnGap={ 2 } flexGrow={{ base: 1, lg: 0 }}>
        <TokenVerifiedInfo verifiedInfoQuery={ verifiedInfoQuery }/>
        <NetworkExplorers type="token" pathParam={ addressHash } ml={{ base: 'auto', lg: 0 }}/>
      </Flex>
    </Flex>
  );

  return (
    <PageTitle
      title={ `${ tokenQuery.data?.name || 'Unnamed token' }${ tokenSymbolText }` }
      isLoading={ isLoading }
      backLink={ backLink }
      beforeTitle={ tokenQuery.data ? (
        <TokenEntity.Icon
          token={ tokenQuery.data }
          isLoading={ isLoading }
          iconSize="lg"
        />
      ) : null }
      contentAfter={ contentAfter }
      secondRow={ secondRow }
    />
  );
};

export default TokenPageTitle;
