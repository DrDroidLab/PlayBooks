import { GET_PLAYBOOKS } from "../../../../constants/index.ts";
import { Playbook, Step, Task } from "../../../../types/index.ts";
import { apiSlice } from "../../../app/apiSlice.ts";
import { store } from "../../../index.ts";
import { playbookSelector, setPlaybookDataBeta } from "../playbookSlice.ts";

export const getPlaybookApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPlaybook: builder.query<Playbook, { playbookId: number }>({
      query: ({ playbookId }) => ({
        url: GET_PLAYBOOKS,
        body: {
          playbook_ids: [playbookId],
        },
        method: "POST",
      }),
      transformResponse: (response) => {
        const { supportedTaskTypes } = playbookSelector(store.getState());
        const playbook = response?.playbooks?.[0] ?? {};
        const tasks: Task[] = [];
        const steps = playbook?.steps?.map((e: Step, i: number) => ({
          ...e,
          ui_requirement: {
            stepIndex: i === 0 ? 0 : undefined,
          },
        }));
        steps.forEach((step: Step) => {
          const stepTasks: any[] = (step.tasks as Task[]).map((e) => ({
            ...e,
            ui_requirement: {
              stepId: step.id,
              resultType: supportedTaskTypes?.find(
                (t: any) =>
                  t.source === e.source &&
                  t.task_type === e[e.source.toLowerCase()]?.type,
              )?.result_type,
            },
          }));
          tasks.push(...stepTasks);
        });
        playbook?.step_relations?.forEach((relation) => {
          const sourceId =
            typeof relation.parent !== "string"
              ? (relation.parent as Step).id
              : "";
          const targetId = (relation.child as Step).id;
          relation.id = `edge-${sourceId}-${targetId}`;
          const rules = relation.condition?.rules ?? [];
          relation.condition.rules = rules.map((rule) => ({
            ...rule,
            task: rule?.task?.id,
          }));
        });
        return {
          ...playbook,
          steps,
          ui_requirement: {
            tasks,
            isExisting: true,
          },
        };
      },
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setPlaybookDataBeta(data));
        } catch (error) {
          // Handle any errors
          console.log(error);
        }
      },
      providesTags: ["Playbooks"],
    }),
  }),
});

export const { useLazyGetPlaybookQuery } = getPlaybookApi;
