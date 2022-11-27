import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

export const getIBMdata = async () => {
  return await axios.get('https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=demo').then((result: { data: { [s: string]: unknown; } | ArrayLike<unknown>; }) => ({
    data: Object.values(Object.values(result.data)[1]),
    time: Object.values(Object.values(result.data)[0]),
  }))
}

export const manipulateData = (dataArray: any) => (
  dataArray.data.map((element: any, index:number) => ({
    name: `${index >= 20 ? index/20 + 'h our(s)': index * 5 + 'mins'}`,
    open: parseFloat(Object.values(element)[0]),
    close: parseFloat(Object.values(element)[3])
  }))
)

export const getMin = (APIData:any):number => {
  return APIData.reduce((acc:number, curr:number) => {
    if(acc === 0 || curr < acc) return curr;
  }, 0)
}

export const getMax = (APIData:any):number => {
  return APIData.reduce((acc:number, curr:number) => {
    if(acc === 0 || curr > acc) return curr;
  }, 0)
}

export const getYmin = (arrayData:any) => {
  const minOpening = getMin(arrayData.map(item => item.open));
  const minClosing = getMin(arrayData.map(item => item.close));
  return minClosing < minOpening ? minClosing : minOpening;
}

export const getYmax = (arrayData:any) => {
  const maxOpening = getMax(arrayData.map(item => item.open));
  const maxClosing = getMax(arrayData.map(item => item.close));
  return maxOpening > maxClosing ? maxOpening : maxClosing;
}

export const App = () => {
  const [APIData, refreshAPIdata] = useState([]);
  const [stockTimeFrame, updateTime] = useState([]);

  useEffect(() => {
    async function getData() {
      const data =  await getIBMdata();
      refreshAPIdata(manipulateData(data));
      updateTime(Object.values(data)[1][2])
    }
    getData();
  }, []);
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric' };

  return <>
    <div style={{padding: "40px"}}>
      <h3>IBM stocks values / real time</h3>
      <p>{stockTimeFrame && new Date(stockTimeFrame).toLocaleDateString("en-US", dateOptions)}</p>
      <i>5 Minutes interval</i>
            {APIData && <LineChart
              width={800}
              height={400}
              data={APIData}
            >
              <CartesianGrid strokeDasharray="1 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[getYmin(APIData), getYmax(APIData)]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="open" stroke="red" fill="#8884d8"  /> 
              <Line type="monotone" dataKey="close" stroke="grey " fill="#8884d8"  /> 
            </LineChart> }
    </div>
  </>
}

export default App;