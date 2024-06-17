import React from 'react';
import type { AbiParameter } from 'viem';

import { matchArray, type MatchArray } from '../utils';
import ItemLabel from './ItemLabel';
import ItemPrimitive from './ItemPrimitive';
import ItemTuple from './ItemTuple';
import { printRowOffset } from './utils';

interface Props {
  abiParameter: AbiParameter;
  data: Array<unknown>;
  level: number;
  arrayMatch: MatchArray;
}

const ItemArray = ({ abiParameter, data, level, arrayMatch }: Props) => {

  const childAbiParameter = React.useMemo(() => {
    const type = arrayMatch.itemType;
    const internalType = matchArray(abiParameter.internalType || '')?.itemType;
    return { ...abiParameter, type, internalType };
  }, [ abiParameter, arrayMatch.itemType ]);

  const content = (() => {
    if (arrayMatch.isNested && data.every(Array.isArray)) {
      const itemArrayMatch = matchArray(arrayMatch.itemType);

      if (itemArrayMatch) {
        return data.map((item, index) => (
          <ItemArray
            key={ index }
            abiParameter={ childAbiParameter }
            data={ item }
            arrayMatch={ itemArrayMatch }
            level={ level + 1 }
          />
        ));
      }
    }

    if (arrayMatch.itemType === 'tuple') {
      return data.map((item, index) => (
        <ItemTuple
          key={ index }
          abiParameter={ childAbiParameter }
          data={ item }
          level={ level + 1 }
        />
      ));
    }

    return data.map((item, index) => (
      <ItemPrimitive
        key={ index }
        abiParameter={ childAbiParameter }
        data={ item }
        level={ level + 1 }
      />
    ));
  })();

  return (
    <p>
      <p>
        <span>{ printRowOffset(level) }</span>
        <ItemLabel abiParameter={ abiParameter }/>
        <span>[{ data.length === 0 ? ' ]' : '' }</span>
      </p>
      { content }
      { data.length > 0 && <p>{ printRowOffset(level) }]</p> }
    </p>
  );
};

export default React.memo(ItemArray);
