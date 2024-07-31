import { DrawerTypes } from "./drawerTypes";
import { PermanentDrawerTypes } from "./permanentDrawerTypes";

export type NormalDrawerTypesKeys =
  (typeof DrawerTypes)[keyof typeof DrawerTypes];
export type PermanentDrawerTypesKeys =
  (typeof PermanentDrawerTypes)[keyof typeof PermanentDrawerTypes];
export type DrawerTypesKeys = PermanentDrawerTypesKeys | NormalDrawerTypesKeys;

export type InitialStateType = {
  [key in DrawerTypesKeys]?: boolean;
} & {
  additionalState: Record<string, any>;
  permanentView: PermanentDrawerTypesKeys;
};

export const initialState: InitialStateType = {
  ...Object.fromEntries(Object.keys(DrawerTypes).map((key) => [key, false])),
  additionalState: {},
  permanentView: PermanentDrawerTypes.DEFAULT,
};
