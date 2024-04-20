/* eslint-disable react-hooks/exhaustive-deps */
import useAxiosPrivate from './hooks/useAxiosPrivate';
import useTimeRange from './hooks/useTimeRange';
import { useCallback } from 'react';
import { showSnackbar } from './store/features/snackbar/snackbarSlice.ts';
import { useDispatch } from 'react-redux';

const defaultRequestHeaders = { 'Content-Type': 'application/json' };

const useApiCallback = () => {
  const { axiosPrivate } = useAxiosPrivate();
  const { timerange, getTimeRange } = useTimeRange();
  const dispatch = useDispatch();

  const updateTimeRangeRequestData = useCallback(
    (setTimeRange, requestData) => {
      if (!setTimeRange || requestData === undefined) {
        return requestData;
      }
      if (requestData?.timeRange) {
        // IMPORTANT: check to mitigate race condition
        if (requestData.meta) {
          requestData.meta.time_range = requestData?.timeRange;
        } else {
          requestData.meta = {
            time_range: requestData?.timeRange
          };
        }
        delete requestData.timeRange;
      } else {
        requestData['meta'] = {
          ...requestData?.meta,
          time_range: getTimeRange()
        };
      }
      return requestData;
    },
    [getTimeRange]
  );

  const callback = useCallback(
    (
      endpoint,
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      },
      setTimeRange = true
    ) => {
      axiosPrivate
        .post(endpoint, updateTimeRangeRequestData(setTimeRange, requestData), {
          headers: { ...defaultRequestHeaders },
          withCredentials: true
        })
        .then(succ => {
          if (succ.status === 200 && succ.data.success === false) {
            const message =
              succ?.data?.message?.description ??
              succ?.data?.task_execution_result?.error ??
              'There was an error';

            dispatch(showSnackbar(message));

            throw new Error(message);
          }
          onSuccess(succ);
        })
        .catch(err => {
          let errObj = {};
          if (err?.response) {
            if (err?.response?.status && [400, 404].includes(err.response.status)) {
              errObj = {
                err: err.response.statusText,
                errorStatusCode: err.response.status
              };
            } else if (err?.response?.status === 500) {
              errObj = {
                err: 'Something went wrong',
                errorStatusCode: err.response.status
              };
            } else if (err?.response?.status === 401) {
              errObj = {
                err: 'Unauthorised',
                errorStatusCode: err?.response?.status
              };
            }
          } else {
            errObj = {
              err: err.message,
              errorStatusCode: 200
            };
          }
          onError(errObj);
        });
    },
    [timerange, getTimeRange, axiosPrivate]
  );

  return callback;
};

const apis = {

  useExecutePlaybooksTask: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
        return e;
      }
    ) => {
      apiCallback(
        '/executor/task/run',
        requestData,
        onSuccess,
        onError,
        false
      );
    };

    return callback;
  },

  useGetPlaybooksData: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/pb/get', requestData, onSuccess, onError, false);
    };

    return callback;
  },

  useSavePlaybook: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);

        console.log('error');
      }
    ) => {
      apiCallback('/pb/create', requestData, onSuccess, onError, false);
    };

    return callback;
  },

  useRunPlayBook: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/connectors/playbooks/run', requestData, onSuccess, onError, false);
    };

    return callback;
  },

  useGetPlaybooksRunLogs: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/connectors/playbooks/run_logs', requestData, onSuccess, onError, false);
    };

    return callback;
  },

  useGetPlaybooksRuns: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/connectors/playbooks/run_list', requestData, onSuccess, onError, false);
    };

    return callback;
  },

  useGetAccountApiToken: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/accounts/account_api_tokens', requestData, onSuccess, onError, false);
    };

    return callback;
  },

  useGetAccountUsers: () => {
    const apiCallback = useApiCallback();
    const callback = (
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/accounts/current_users', {}, onSuccess, onError, false);
    };

    return callback;
  },

  useSendInvites: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/accounts/invite_users', requestData, onSuccess, onError, false);
    };

    return callback;
  },

  useConnectorRequest: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/connectors/request', requestData, onSuccess, onError);
    };

    return callback;
  },

  useListIntegrations: () => {
    const apiCallback = useApiCallback();
    const callback = (
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/connectors/list', {}, onSuccess, onError);
    };

    return callback;
  },

  useGetReportURL: () => {
    const apiCallback = useApiCallback();
    const callback = (
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/connectors/report_link', {}, onSuccess, onError);
    };

    return callback;
  },

  useGetSlackAlertsSearch: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/connectors/alertops/slack/alerts/search', requestData, onSuccess, onError);
    };

    return callback;
  },

  useGetAlertsInvestigationLogic: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback(
        '/connectors/alertops/slack/alerts/get_investigation_logic',
        requestData,
        onSuccess,
        onError
      );
    };

    return callback;
  },

  useExecuteAlertsInvestigationLogic: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback(
        '/connectors/alertops/slack/alerts/run_investigations',
        requestData,
        onSuccess,
        onError
      );
    };

    return callback;
  },

  useSlackChannelOptions: () => {
    const apiCallback = useApiCallback();
    const callback = (
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/connectors/alertops/slack_channel_options', {}, onSuccess, onError);
    };

    return callback;
  },

  useGetGoogleSpacesList: () => {
    const apiCallback = useApiCallback();
    const callback = (
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/connectors/integrations/handlers/g_chat/list_spaces', {}, onSuccess, onError);
    };
    return callback;
  },

  useRegisterGoogleSpaces: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback(
        '/connectors/integrations/handlers/g_chat/register_spaces',
        requestData,
        onSuccess,
        onError
      );
    };
    return callback;
  },

  useGetBasicReport: () => {
    const apiCallback = useApiCallback();
    const callback = (
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/connectors/alertops/basic_report', {}, onSuccess, onError);
    };

    return callback;
  },

  useGetIntegrationKeys: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      },
      setTimeRange = true
    ) => {
      apiCallback('/connectors/get_keys', requestData, onSuccess, onError, setTimeRange);
    };

    return callback;
  },

  useDeleteIntegrationKeys: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      },
      setTimeRange = true
    ) => {
      apiCallback('/connectors/delete_keys', requestData, onSuccess, onError, setTimeRange);
    };

    return callback;
  },

  useSaveIntegrationKeys: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      },
      setTimeRange = true
    ) => {
      apiCallback('/connectors/save_keys', requestData, onSuccess, onError, setTimeRange);
    };

    return callback;
  },
  
  /////////////////////////////// Alert Insights Product APIs
  useGetAlertOptions: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/connectors/alertops/options/get', requestData, onSuccess, onError);
    };
    return callback;
  },
  useGetAlertDistributionByChannel: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback(
        '/connectors/alertops/slack/get_alert_distribution_by_channel',
        requestData,
        onSuccess,
        onError
      );
    };
    return callback;
  },

  useGetAlertDistributionByAlertType: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback(
        '/connectors/alertops/slack/get_alert_distribution_by_alert_type',
        requestData,
        onSuccess,
        onError
      );
    };
    return callback;
  },

  useGetAlertMostFrequent: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback(
        '/connectors/alertops/slack/get_alert_most_frequent',
        requestData,
        onSuccess,
        onError
      );
    };
    return callback;
  },
  useMostFrequentAlertDistribution: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback(
        '/connectors/alertops/slack/get_alert_most_frequent_distribution',
        requestData,
        onSuccess,
        onError
      );
    };
    return callback;
  },

  useInstallDataDogIntegration: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback(
        '/connectors/integrations/handlers/datadog/r2d2/install',
        requestData,
        onSuccess,
        onError
      );
    };
    return callback;
  },

  useGetAlertMetric: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/connectors/alertops/slack/get_alert_metric', requestData, onSuccess, onError);
    };
    return callback;
  },

  useGetAlertTagOptions: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback(
        '/connectors/alertops/slack/options/get_alert_tags',
        requestData,
        onSuccess,
        onError
      );
    };
    return callback;
  },

  useGenerateAQS: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback(
        '/connectors/alertops/slack/alerts/generate_aqs',
        requestData,
        onSuccess,
        onError
      );
    };
    return callback;
  },

  useGenerateAQSTrend: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback(
        '/connectors/alertops/slack/alerts/generate_aqs_trend',
        requestData,
        onSuccess,
        onError
      );
    };
    return callback;
  },

  useGetConnectedIntegrations: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback(
        '/connectors/alertops/options/get_connected_integration',
        requestData,
        onSuccess,
        onError
      );
    };
    return callback;
  },

  useGetMostAlertingEntities: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback(
        '/connectors/alertops/get_most_alerting_entities_by_tools',
        requestData,
        onSuccess,
        onError
      );
    };
    return callback;
  },

  useGetNewRelicAssets: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/connectors/alertops/newrelic_assets', requestData, onSuccess, onError);
    };
    return callback;
  },

  useGetDataDogAssets: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/connectors/alertops/datadog_assets', requestData, onSuccess, onError);
    };
    return callback;
  },

  useGetCloudwatchAssets: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/connectors/alertops/cloudwatch_assets', requestData, onSuccess, onError);
    };
    return callback;
  },

  useGetClickhouseAssets: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/connectors/alertops/clickhouse_assets', requestData, onSuccess, onError);
    };
    return callback;
  },

  useGetAssetModels: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/connectors/assets/models/get', requestData, onSuccess, onError);
    };
    return callback;
  },

  useGetGrafanaAssets: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/connectors/alertops/grafana_assets', requestData, onSuccess, onError);
    };
    return callback;
  },

  useRequestSlackConnect: () => {
    const apiCallback = useApiCallback();
    const callback = (
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback('/connectors/alertops/slack/connect', requestData, onSuccess, onError);
    };
    return callback;
  },

  // Custom URL post call
  useCustomRequest: () => {
    const apiCallback = useApiCallback();
    const callback = (
      postUrl,
      requestData,
      onSuccess,
      onError = e => {
        console.log(e);
      }
    ) => {
      apiCallback(postUrl, requestData, onSuccess, onError);
    };

    return callback;
  }
};

export default apis;
