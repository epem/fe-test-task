import { useState, useEffect } from 'react';
import { RootState, RowData } from '../interfaces';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { findChart, getBoligTypeValue, getQarterPrice, getTidArray } from '../utils';
import { useGetChartDataMutation } from '../state/api';

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export const  useChartData = () => {
  const [chartData, setChartData] = useState<RowData | null>(null);
  const { localstorage, startTid, endTid, boligType, contentsCode, responseFormat  } = useTypedSelector((state) => state.global);
  const [getRawChartData] = useGetChartDataMutation()

  useEffect(() => {
    const localChartData = findChart(startTid, endTid, boligType, localstorage)
    if (localChartData) {
      const { chartPoints, saved } = localChartData
      setChartData({ chartPoints, boligType, startTid, endTid, saved });
      return;
    }
    const getChartData = async (startTid: string, endTid: string, boligType: string):Promise<void> => {
      if (startTid && endTid && boligType) {
        const tidArray = getTidArray(startTid, endTid);
        const boligTypeValue = getBoligTypeValue(boligType);
        const tempBody = {
          boligType: boligTypeValue,
          contentsCode,
          tid: tidArray,
          responseFormat
        }
        try {
          const chartDataResponse = await getRawChartData(tempBody);
          if ('error' in chartDataResponse) throw Error(`Error fetching data`)
          const chartPoints = getQarterPrice(chartDataResponse.data.value, tidArray);
          setChartData({ chartPoints, boligType, startTid, endTid, saved: false });
        } catch (error) {
          console.log(error);
        }
      }
    };
    getChartData(startTid, endTid, boligType );
  }, [localstorage, getRawChartData, startTid, endTid, boligType, contentsCode, responseFormat]);

  return [chartData]
}