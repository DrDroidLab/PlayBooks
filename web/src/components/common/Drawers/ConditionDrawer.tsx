import CustomDrawer from "../CustomDrawer/index.tsx";
import { DrawerTypes } from "../../../store/features/drawers/drawerTypes.ts";
import AddCondition from "../../AddCondition/index.tsx";
import useDrawerState from "../../../hooks/common/useDrawerState.ts";

const id = DrawerTypes.CONDITION;

function ConditionDrawer() {
  const { isOpen } = useDrawerState(id);

  if (!isOpen) return;

  return (
    <CustomDrawer id={id} startFrom="80">
      <div className="flex-[0.4] border-l-[1px] border-l-gray-200 h-full overflow-scroll">
        <AddCondition />
      </div>
    </CustomDrawer>
  );
}

export default ConditionDrawer;
