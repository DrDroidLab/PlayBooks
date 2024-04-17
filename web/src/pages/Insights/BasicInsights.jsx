/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import SuspenseLoader from '../../components/Skeleton/SuspenseLoader';
import TableSkeleton from '../../components/Skeleton/TableLoader';
import API from '../../API';
import styles from './index.module.css';
import Toast from '../../components/Toast';
import useToggle from '../../hooks/useToggle';
import ReactECharts from 'echarts-for-react';

const BasicInsights = () => {
  const [loading, setLoading] = useState(false);
  const [errMessage, setErrMessage] = useState('');
  const { isOpen: IsError, toggle: toggleError } = useToggle();
  const [graphs, setGraphs] = useState([]);

  const getBasicReport = API.useGetBasicReport();

  const calculateReportOptions = report => {
    const { alert_type_count_time_series, title, slack_channel, x_series } = report;
    const textTitle = slack_channel?.channel_id ? `${title} (${slack_channel?.channel_id})` : title;
    const option = {
      title: {
        text: textTitle
      },
      tooltip: {
        trigger: 'axis'
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: x_series,
        show: true
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: 'blue',
          width: '4'
        }
      },
      legend: {
        data: alert_type_count_time_series.map(item => item.alert_type)
      },
      grid: {
        top: 60,
        left: 30,
        right: 60,
        bottom: 30
      },
      series: alert_type_count_time_series.map(item => ({
        name: item.alert_type,
        type: 'line',
        data: item.y_series
      })),
      yAxis: {
        type: 'value'
      }
    };
    return option;
  };
  useEffect(() => {
    setLoading(true);
    getBasicReport(
      response => {
        const reports = response.data?.reports;
        const resp = reports.map(report => calculateReportOptions(report));
        console.log(resp);
        setGraphs(resp);
        setLoading(false);
      },
      err => {
        console.error(err);
        toggleError();
        setErrMessage('No Report Found');
        setLoading(false);
      }
    );
  }, []);

  const renderGraphs = graphs.map((graph, index) => (
    <div key={index} className={styles['chart__item']}>
      <ReactECharts option={graph} style={{ height: 400 }} />
    </div>
  ));

  return (
    <>
      <SuspenseLoader loading={!!loading} loader={<TableSkeleton />}>
        <div className={styles['chart__container']}>{renderGraphs}</div>
      </SuspenseLoader>
      <Toast
        open={!!IsError}
        severity="error"
        message={errMessage}
        handleClose={() => toggleError()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </>
  );
};

export default BasicInsights;
