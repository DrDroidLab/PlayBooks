export const handleLegendClick =
  (selectedLegends: any, setSelectedLegends: any, setChartOptions: any) =>
  (keyPressed: boolean) =>
  (params: any) => {
    let newSelectedLegends = selectedLegends;
    const selectedLegendsFiltered = Object.values(selectedLegends).filter(
      (e) => e,
    );
    const allSelected =
      selectedLegendsFiltered.length === Object.keys(selectedLegends).length;
    const isSelected = selectedLegends[params.name];

    if (!allSelected && isSelected) {
      for (let legend of Object.keys(selectedLegends)) {
        newSelectedLegends[legend] = true;
      }
    } else {
      if (keyPressed) {
        newSelectedLegends = {
          ...newSelectedLegends,
          [params.name]: !isSelected,
        };
      } else {
        for (let legend of Object.keys(selectedLegends)) {
          newSelectedLegends[legend] = false;
        }
        newSelectedLegends = {
          ...newSelectedLegends,
          [params.name]: true,
        };
      }
    }

    setChartOptions((prev: any) => {
      return {
        ...prev,
        legend: {
          ...prev.legend,
          selected: newSelectedLegends,
        },
      };
    });

    setSelectedLegends(newSelectedLegends);
  };
