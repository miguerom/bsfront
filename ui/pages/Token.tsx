import { Box } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import type { SocketMessage } from 'lib/socket/types';
import type { TokenInfo } from 'types/api/token';
import type { PaginationParams } from 'ui/shared/pagination/types';
import type { RoutedTab } from 'ui/shared/Tabs/types';

import useApiQuery, { getResourceKey } from 'lib/api/useApiQuery';
import useContractTabs from 'lib/hooks/useContractTabs';
import useIsMobile from 'lib/hooks/useIsMobile';
import * as metadata from 'lib/metadata';
import getQueryParamString from 'lib/router/getQueryParamString';
import useSocketChannel from 'lib/socket/useSocketChannel';
import useSocketMessage from 'lib/socket/useSocketMessage';
import { NFT_TOKEN_TYPE_IDS } from 'lib/token/tokenTypes';
import * as addressStubs from 'stubs/address';
import * as tokenStubs from 'stubs/token';
import { getTokenHoldersStub } from 'stubs/token';
import { generateListStub } from 'stubs/utils';
import AddressContract from 'ui/address/AddressContract';
import AddressCsvExportLink from 'ui/address/AddressCsvExportLink';
import TextAd from 'ui/shared/ad/TextAd';
import IconSvg from 'ui/shared/IconSvg';
import Pagination from 'ui/shared/pagination/Pagination';
import useQueryWithPages from 'ui/shared/pagination/useQueryWithPages';
import RoutedTabs from 'ui/shared/Tabs/RoutedTabs';
import TabsSkeleton from 'ui/shared/Tabs/TabsSkeleton';
import TokenDetails from 'ui/token/TokenDetails';
import TokenHolders from 'ui/token/TokenHolders/TokenHolders';
import TokenInventory from 'ui/token/TokenInventory';
import TokenPageTitle from 'ui/token/TokenPageTitle';
import TokenTransfer from 'ui/token/TokenTransfer/TokenTransfer';
import useTokenQuery from 'ui/token/useTokenQuery';

export type TokenTabs = 'token_transfers' | 'holders' | 'inventory';

const TABS_RIGHT_SLOT_PROPS = {
  display: 'flex',
  alignItems: 'center',
  columnGap: 4,
};

const TokenPageContent = () => {
  const [ isQueryEnabled, setIsQueryEnabled ] = React.useState(false);
  const [ totalSupplySocket, setTotalSupplySocket ] = React.useState<number>();
  const router = useRouter();
  const isMobile = useIsMobile();

  const scrollRef = React.useRef<HTMLDivElement>(null);

  const hashString = getQueryParamString(router.query.hash);
  const tab = getQueryParamString(router.query.tab);
  const ownerFilter = getQueryParamString(router.query.holder_address_hash) || undefined;

  const queryClient = useQueryClient();

  const tokenQuery = useTokenQuery(hashString);

  const addressQuery = useApiQuery('address', {
    pathParams: { hash: hashString },
    queryOptions: {
      enabled: isQueryEnabled && Boolean(router.query.hash),
      placeholderData: addressStubs.ADDRESS_INFO,
    },
  });

  React.useEffect(() => {
    if (tokenQuery.data && totalSupplySocket) {
      queryClient.setQueryData(getResourceKey('token', { pathParams: { hash: hashString } }), (prevData: TokenInfo | undefined) => {
        if (prevData) {
          return { ...prevData, total_supply: totalSupplySocket.toString() };
        }
      });
    }
  }, [ tokenQuery.data, totalSupplySocket, hashString, queryClient ]);

  const handleTotalSupplyMessage: SocketMessage.TokenTotalSupply['handler'] = React.useCallback((payload) => {
    const prevData = queryClient.getQueryData(getResourceKey('token', { pathParams: { hash: hashString } }));
    if (!prevData) {
      setTotalSupplySocket(payload.total_supply);
    }
    queryClient.setQueryData(getResourceKey('token', { pathParams: { hash: hashString } }), (prevData: TokenInfo | undefined) => {
      if (prevData) {
        return { ...prevData, total_supply: payload.total_supply.toString() };
      }
    });
  }, [ queryClient, hashString ]);

  const enableQuery = React.useCallback(() => setIsQueryEnabled(true), []);

  const channel = useSocketChannel({
    topic: `tokens:${ hashString?.toLowerCase() }`,
    isDisabled: !hashString,
    onJoin: enableQuery,
    onSocketError: enableQuery,
  });
  useSocketMessage({
    channel,
    event: 'total_supply',
    handler: handleTotalSupplyMessage,
  });

  useEffect(() => {
    if (tokenQuery.data && !tokenQuery.isPlaceholderData) {
      metadata.update({ pathname: '/token/[hash]', query: { hash: tokenQuery.data.address } }, tokenQuery.data);
    }
  }, [ tokenQuery.data, tokenQuery.isPlaceholderData ]);

  const hasData = (tokenQuery.data && !tokenQuery.isPlaceholderData) && (addressQuery.data && !addressQuery.isPlaceholderData);
  const hasInventoryTab = tokenQuery.data?.type && NFT_TOKEN_TYPE_IDS.includes(tokenQuery.data.type);

  const transfersQuery = useQueryWithPages({
    resourceName: 'token_transfers',
    pathParams: { hash: hashString },
    scrollRef,
    options: {
      enabled: Boolean(
        hasData &&
        hashString &&
        (
          (!hasInventoryTab && !tab) ||
          tab === 'token_transfers'
        ),
      ),
      placeholderData: tokenStubs.getTokenTransfersStub(tokenQuery.data?.type),
    },
  });

  const inventoryQuery = useQueryWithPages({
    resourceName: 'token_inventory',
    pathParams: { hash: hashString },
    filters: ownerFilter ? { holder_address_hash: ownerFilter } : {},
    scrollRef,
    options: {
      enabled: Boolean(
        hasData &&
        hashString &&
        (
          (hasInventoryTab && !tab) ||
          tab === 'inventory'
        ),
      ),
      placeholderData: generateListStub<'token_inventory'>(tokenStubs.TOKEN_INSTANCE, 50, { next_page_params: { unique_token: 1 } }),
    },
  });

  const holdersQuery = useQueryWithPages({
    resourceName: 'token_holders',
    pathParams: { hash: hashString },
    scrollRef,
    options: {
      enabled: Boolean(hashString && tab === 'holders' && hasData),
      placeholderData: getTokenHoldersStub(tokenQuery.data?.type, null),
    },
  });

  const contractTabs = useContractTabs(addressQuery.data, addressQuery.isPlaceholderData);

  const tabs: Array<RoutedTab> = [
    hasInventoryTab ? {
      id: 'inventory',
      title: 'Inventory',
      component: <TokenInventory inventoryQuery={ inventoryQuery } tokenQuery={ tokenQuery } ownerFilter={ ownerFilter }/>,
    } : undefined,
    { id: 'token_transfers', title: 'Token transfers', component: <TokenTransfer transfersQuery={ transfersQuery } token={ tokenQuery.data }/> },
    { id: 'holders', title: 'Holders', component: <TokenHolders token={ tokenQuery.data } holdersQuery={ holdersQuery }/> },
    addressQuery.data?.is_contract ? {
      id: 'contract',
      title: () => {
        if (addressQuery.data?.is_verified) {
          return (
            <>
              <span>Contract</span>
              <IconSvg name="status/success" boxSize="14px" color="green.500" ml={ 1 }/>
            </>
          );
        }

        return 'Contract';
      },
      component: <AddressContract tabs={ contractTabs.tabs } isLoading={ contractTabs.isLoading }/>,
      subTabs: contractTabs.tabs.map(tab => tab.id),
    } : undefined,
  ].filter(Boolean);

  let pagination: PaginationParams | undefined;

  // default tab for erc-20 is token transfers
  if ((tokenQuery.data?.type === 'ERC-20' && !tab) || tab === 'token_transfers') {
    pagination = transfersQuery.pagination;
  }

  if (router.query.tab === 'holders') {
    pagination = holdersQuery.pagination;
  }

  // default tab for nfts is token inventory
  if ((hasInventoryTab && !tab) || tab === 'inventory') {
    pagination = inventoryQuery.pagination;
  }

  const tabListProps = React.useCallback(({ isSticky, activeTabIndex }: { isSticky: boolean; activeTabIndex: number }) => {
    if (isMobile) {
      return { mt: 8 };
    }

    return {
      mt: 3,
      py: 5,
      marginBottom: 0,
      boxShadow: activeTabIndex === 2 && isSticky ? 'action_bar' : 'none',
    };
  }, [ isMobile ]);

  const isLoading = tokenQuery.isPlaceholderData || addressQuery.isPlaceholderData;

  const tabsRightSlot = React.useMemo(() => {
    if (isMobile) {
      return null;
    }

    return (
      <>
        { tab === 'holders' && (
          <AddressCsvExportLink
            address={ hashString }
            params={{ type: 'holders' }}
            isLoading={ pagination?.isLoading }
          />
        ) }
        { pagination?.isVisible && <Pagination { ...pagination }/> }
      </>
    );
  }, [ hashString, isMobile, pagination, tab ]);

  return (
    <>
      <TextAd mb={ 6 }/>

      <TokenPageTitle tokenQuery={ tokenQuery } addressQuery={ addressQuery } isLoading={ isLoading }/>

      <TokenDetails tokenQuery={ tokenQuery }/>

      { /* should stay before tabs to scroll up with pagination */ }
      <Box ref={ scrollRef }></Box>

      { isLoading ?
        <TabsSkeleton tabs={ tabs }/> :
        (
          <RoutedTabs
            tabs={ tabs }
            tabListProps={ tabListProps }
            rightSlot={ tabsRightSlot }
            rightSlotProps={ TABS_RIGHT_SLOT_PROPS }
            stickyEnabled={ !isMobile }
          />
        ) }
    </>
  );
};

export default TokenPageContent;
