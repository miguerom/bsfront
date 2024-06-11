import React from 'react';

export default function useZoomReset() {
  const [ isZoomResetInitial, setIsZoomResetInitial ] = React.useState(true);

  const handleZoom = React.useCallback(() => {
    setIsZoomResetInitial(false);
  }, []);

  const handleZoomResetClick = React.useCallback(() => {
    setIsZoomResetInitial(true);
  }, []);

  return {
    isZoomResetInitial,
    handleZoom,
    handleZoomResetClick,
  };
}
