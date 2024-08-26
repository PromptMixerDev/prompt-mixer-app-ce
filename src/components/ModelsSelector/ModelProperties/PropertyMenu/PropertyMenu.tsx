import React from 'react';
import { type Property } from 'db/workspaceDb';
import { ReactComponent as PropertyIcon } from 'assets/icons/property.svg';
import {
  type ContextMenuOption,
  ContextMenuWithOptions,
} from '../../../Modals/ContextMenuWithOptions';
import { AlignValues } from '../../../Modals/ContextMenu';

interface PropertyMenuProps {
  properties: Property[];
  setShowPropertyMenu: (value: boolean) => void;
  ignoreElementRef: React.RefObject<HTMLElement>;
  triggerRef: React.RefObject<HTMLElement>;
  addProperty: (value: Property) => void;
}

export const PropertyMenu: React.FC<PropertyMenuProps> = ({
  properties,
  setShowPropertyMenu,
  ignoreElementRef,
  triggerRef,
  addProperty,
}) => {
  const getContextMenuOptions = (
    properties: Property[]
  ): ContextMenuOption[][] => [
    properties.map((property) => ({
      label: property.Name,
      icon: PropertyIcon,
      onClick: () => addProperty(property),
    })),
  ];

  return (
    <ContextMenuWithOptions
      optionGroups={getContextMenuOptions(properties)}
      onClose={() => setShowPropertyMenu(false)}
      ignoreElementRef={ignoreElementRef}
      triggerRef={triggerRef}
      align={AlignValues.UNDER}
      offset={0}
    />
  );
};
