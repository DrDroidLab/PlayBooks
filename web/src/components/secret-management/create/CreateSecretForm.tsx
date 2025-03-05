import CustomInput from "../../Inputs/CustomInput";
import { InputTypes } from "../../../types";
import { useDispatch, useSelector } from "react-redux";
import CustomButton from "../../common/CustomButton";
import { showSnackbar } from "../../../store/features/snackbar/snackbarSlice";
import { CircularProgress } from "@mui/material";
import React, { useEffect } from "react";
// import {
//   useCreateVariableMutation,
//   useGetVariableApiQuery,
//   useUpdateVariableMutation,
// } from "../../../store/features/variables/api";
import TableLoader from "../../Skeleton/TableLoader";
import { secretsSelector } from "../../../store/features/secrets/selectors";
import {
  resetSecretState,
  setSecretKey,
} from "../../../store/features/secrets/secretsSlice";
import { SecretsInitialState } from "../../../store/features/secrets/initialState";

type CreateSecretFormProps = {
  toggleOverlay?: () => void;
  id?: string;
};

function CreateSecretForm({
  toggleOverlay = () => {},
  id,
}: CreateSecretFormProps) {
  const dispatch = useDispatch();
  // const [triggerCreate, { isLoading }] = useCreateVariableMutation();
  // const [triggerUpdate, { isLoading: updateLoading }] =
  //   useUpdateVariableMutation();
  const { name, description, options } = useSelector(secretsSelector);
  // const { isLoading: isLoadingVariable } = useGetVariableApiQuery(
  //   {
  //     id: id!,
  //   },
  //   {
  //     skip: !id,
  //   },
  // );

  const handleChange = (key: keyof SecretsInitialState, value: any) => {
    dispatch(
      setSecretKey({
        key,
        value,
      }),
    );
  };

  const validate = () => {
    let error = "";
    if (!name || !description || !options) {
      error = "Please fill all fields";
    }

    if (error) {
      dispatch(showSnackbar({ message: error, type: "error" }));
    }
    return error;
  };

  const handleCreate = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    if (validate()) return;

    try {
      // await triggerCreate({
      //   name,
      //   description,
      //   options: options.split(", "),
      // }).unwrap();
      dispatch(resetSecretState());
      toggleOverlay();
    } catch (e: any) {
      dispatch(
        showSnackbar({
          message: `Failed to create variable: ${JSON.stringify(
            e?.message ?? e,
          )}`,
          type: "error",
        }),
      );
    }
  };

  const handleUpdate = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    if (validate()) return;

    try {
      // await triggerUpdate({
      //   id: id!,
      //   name,
      //   description,
      //   options: options.split(", "),
      // }).unwrap();
      dispatch(resetSecretState());
      toggleOverlay();
    } catch (e: any) {
      dispatch(
        showSnackbar({
          message: `Failed to update variable: ${JSON.stringify(
            e?.message ?? e,
          )}`,
          type: "error",
        }),
      );
    }
  };

  useEffect(() => {
    return () => {
      dispatch(resetSecretState());
    };
  }, [dispatch]);

  // if (isLoadingVariable) {
  //   return (
  //     <div className="flex items-center justify-center my-3">
  //       <TableLoader noOfLines={3} />
  //     </div>
  //   );
  // }

  return (
    <form className="flex flex-col items-stretch gap-2 w-full">
      <CustomInput
        inputType={InputTypes.TEXT}
        value={name}
        label="Name"
        placeholder="Enter variable name"
        handleChange={(value) => handleChange("name", value)}
        containerClassName="!w-full"
        className="w-full"
      />
      <CustomInput
        inputType={InputTypes.MULTILINE}
        value={description}
        label="Description"
        placeholder="What is this variable for?"
        handleChange={(value) => handleChange("description", value)}
        containerClassName="!w-full"
        className="w-full !h-20"
      />
      <CustomInput
        inputType={InputTypes.MULTILINE}
        value={options}
        label="Options"
        placeholder="Enter the valid options for this variable separated by commas"
        handleChange={(value) => handleChange("options", value)}
        containerClassName="!w-full"
        className="w-full"
      />
      <div className="flex items-center gap-2">
        {id ? (
          <CustomButton
            // disabled={updateLoading}
            className="w-fit"
            onClick={handleUpdate}>
            Update
          </CustomButton>
        ) : (
          <CustomButton
            // disabled={isLoading}
            className="w-fit"
            onClick={handleCreate}>
            Save
          </CustomButton>
        )}
        {/* {(isLoading || updateLoading) && <CircularProgress size={15} />} */}
      </div>
    </form>
  );
}

export default CreateSecretForm;
