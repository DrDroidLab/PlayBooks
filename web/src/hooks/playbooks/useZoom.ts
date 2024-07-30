import usePlaybookKey from "./usePlaybookKey";

function useZoom() {
  const [zoom, setZoom] = usePlaybookKey("zoomLevel");

  const onZoomChange = (viewport) => {
    setZoom(viewport.zoom);
  };

  const toolbarStyle = {
    transform: `scale(${zoom + 0.25})`,
    transition: "all 0.2s",
  };

  return { zoom, onZoomChange, toolbarStyle };
}

export default useZoom;
