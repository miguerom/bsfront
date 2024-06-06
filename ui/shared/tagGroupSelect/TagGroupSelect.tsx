import { HStack, Tag, chakra } from '@chakra-ui/react';
import React from 'react';

type Props = {
  items: Array<string>;
  defaultValue: string | Array<string>;
  isMulti?: boolean;
  onChange: (value: Array<string>) => void;
  className?: string;
}

const TagGroupSelect = ({ items, defaultValue, isMulti, onChange, className }: Props) => {
  const [ value, setValue ] = React.useState<Array<string>>(Array.isArray(defaultValue) ? defaultValue : [ defaultValue ]);

  const onItemClick = React.useCallback((event: React.SyntheticEvent) => {
    const itemValue = (event.currentTarget as HTMLDivElement).getAttribute('data-id') as string;
    setValue((prevValue) => {
      let newValue;
      if (isMulti) {
        if (prevValue.includes(itemValue)) {
          newValue = prevValue.filter(i => i !== itemValue);
        } else {
          newValue = [ ...prevValue, itemValue ];
        }
      } else {
        newValue = [ itemValue ];
      }
      onChange(newValue);
      return newValue;
    });

  }, [ isMulti, onChange ]);

  return (
    <HStack className={ className }>
      { items.map(item => {
        const isActive = value.includes(item);
        return (
          <Tag
            key={ item }
            data-id={ item }
            variant={ isActive ? 'selectActive' : 'select' }
            fontWeight={ 500 }
            cursor="pointer"
            onClick={ onItemClick }
          >
            { item }
          </Tag>
        );
      }) }
    </HStack>
  );
};

export default chakra(TagGroupSelect);
