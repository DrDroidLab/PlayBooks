import CustomInput from "../../Inputs/CustomInput";
import { InputTypes } from "../../../types";
import { useDispatch, useSelector } from "react-redux";
import CustomButton from "../../common/CustomButton";
import { showSnackbar } from "../../../store/features/snackbar/snackbarSlice";
import { CircularProgress } from "@mui/material";
import React, { useEffect } from "react";
import TableLoader from "../../Skeleton/TableLoader";
import { secretsSelector } from "../../../store/features/secrets/selectors";
import {
  resetSecretState,
  setSecretKey,
} from "../../../store/features/secrets/secretsSlice";
import { SecretsInitialState } from "../../../store/features/secrets/initialState";
import {
  useCreateSecretMutation,
  useGetSecretQuery,
  useUpdateSecretMutation,
} from "../../../store/features/secrets/api";
import { SaveRounded } from "@mui/icons-material";

type CreateSecretFormProps = {
  toggleOverlay?: () => void;
  id?: string;
};

function CreateSecretForm({
  toggleOverlay = () => {},
  id,
}: CreateSecretFormProps) {
  const dispatch = useDispatch();
  const [triggerCreate, { isLoading }] = useCreateSecretMutation();
  const [triggerUpdate, { isLoading: updateLoading }] =
    useUpdateSecretMutation();
  const secret = useSelector(secretsSelector);
  const { key, description, value } = secret;
  const { isLoading: isLoadingSecret } = useGetSecretQuery(
    {
      id: id!,
    },
    {
      skip: !id,
      refetchOnMountOrArgChange: true,
    },
  );

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
    if (!key || !value) {
      error = "Please fill all the required fields";
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
      await triggerCreate(secret).unwrap();
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
      await triggerUpdate({
        id: id!,
        key,
        description,
        value: value,
      }).unwrap();
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

  if (isLoadingSecret) {
    return (
      <div className="flex items-center justify-center my-3">
        <TableLoader noOfLines={3} />
      </div>
    );
  }

  return (
    <form className="flex flex-col items-stretch gap-2 w-full">
      <CustomInput
        inputType={InputTypes.TEXT}
        value={key}
        label="Name"
        placeholder="Enter secret name"
        handleChange={(value) => handleChange("key", value)}
        containerClassName="!w-full"
        className="w-full"
        disabled={id !== undefined}
      />
      <CustomInput
        inputType={InputTypes.MULTILINE}
        value={description}
        label="Description"
        placeholder="What is this secret for?"
        handleChange={(value) => handleChange("description", value)}
        containerClassName="!w-full"
        className="w-full !h-20"
      />
      <CustomInput
        inputType={InputTypes.TEXT}
        value={value}
        label="Value"
        placeholder="Enter the secret value..."
        handleChange={(value) => handleChange("value", value)}
        containerClassName="!w-full"
        className="w-full"
      />
      <div className="flex items-center gap-2">
        {id ? (
          <CustomButton
            disabled={updateLoading}
            className="w-fit"
            onClick={handleUpdate}>
            <SaveRounded fontSize="small" />
            Update
          </CustomButton>
        ) : (
          <CustomButton
            disabled={isLoading}
            className="w-fit"
            onClick={handleCreate}>
            <SaveRounded fontSize="small" />
            Save
          </CustomButton>
        )}
        {(isLoading || updateLoading) && <CircularProgress size={15} />}
      </div>
    </form>
  );
}

export default CreateSecretForm;
