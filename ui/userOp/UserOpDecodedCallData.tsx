import React from 'react';

import type { UserOp } from 'types/api/userOps';

import DetailsInfoItem from 'ui/shared/DetailsInfoItem';
import LogDecodedInputData from 'ui/shared/logs/LogDecodedInputData';

import UserOpCallDataSwitch from './UserOpCallDataSwitch';

interface Props {
  data: UserOp;
}

const UserOpDecodedCallData = ({ data }: Props) => {

  const [ callData, setCallData ] = React.useState(data.decoded_call_data || data.decoded_execute_call_data);

  const handleSwitchChange = React.useCallback((isChecked: boolean) => {
    setCallData(isChecked ? data.decoded_execute_call_data : data.decoded_call_data);
  }, [ data ]);

  if (!callData) {
    return null;
  }

  const toggler = data.decoded_execute_call_data ? (
    <UserOpCallDataSwitch
      onChange={ handleSwitchChange }
      initialValue={ !data.decoded_call_data }
      isDisabled={ !data.decoded_call_data }
    />
  ) : null;

  return (
    <DetailsInfoItem
      title="Decoded call data"
      hint="Decoded call data"
    >
      <LogDecodedInputData data={ callData } rightSlot={ toggler }/>
    </DetailsInfoItem>
  );
};

export default React.memo(UserOpDecodedCallData);
