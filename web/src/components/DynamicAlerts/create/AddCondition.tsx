import CommonConditionTop from "../../common/Conditions/CommonConditionTop";

function AddCondition() {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-bold text-violet-500 text-sm">Conditions</p>
      <CommonConditionTop />
      {/* <div className="flex flex-col items-start gap-1 mt-4">
        <p className="text-xs text-violet-500 font-semibold">
          Select a global rule
        </p>
        <CustomInput
          inputType={InputTypes.DROPDOWN}
          options={ruleOptions}
          value={""}
          placeholder={`Select Global Rule`}
          handleChange={() => {}}
          error={undefined}
        />
      </div> */}
    </div>
  );
}

export default AddCondition;
