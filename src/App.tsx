import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

export const getIBMdata = async () => {
  return await axios.get('https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=demo').then((result: { data: { [s: string]: unknown; } | ArrayLike<unknown>; }) => ({
    data: Object.values(Object.values(result.data)[1] as any),
    time: Object.values(Object.values(result.data)[0] as any),
  }))
}

export const manipulateData = (dataArray: any) => (
  dataArray.data.map((element: any, index:number) => ({
    name: `${index >= 12 ? index/12 + 'hour(s)': index * 5 + 'mins'}`,
    //ts-ignore
    open: parseFloat(Object.values(element)[0] as any),
    close: parseFloat(Object.values(element)[3] as any)
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
  const minOpening = getMin(arrayData.map((item: { open: any; }) => item.open));
  const minClosing = getMin(arrayData.map((item: { close: any; }) => item.close));
  return minClosing < minOpening ? minClosing : minOpening;
}

export const getYmax = (arrayData:any) => {
  const maxOpening = getMax(arrayData.map((item: { open: any; }) => item.open));
  const maxClosing = getMax(arrayData.map((item: { close: any; }) => item.close));
  return maxOpening > maxClosing ? maxOpening : maxClosing;
}

export const App = () => {
  const [APIData, refreshAPIdata] = useState([]);
  const [stockTimeFrame, updateTime] = useState(null);

  useEffect(() => {
    async function getData() {
      const data =  await getIBMdata();
      refreshAPIdata(manipulateData(data));
      try{
        updateTime((Object.values(data)[1] as any)[2] )
      }catch(error) {
        console.log(error)
      }
    }
    getData();
  }, []);

  return <>
    <div style={{padding: "40px"}}>
      <h3>IBM stocks values / real time</h3>
      <p>{stockTimeFrame && new Date(stockTimeFrame).toLocaleDateString("en-US",  { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric' })}</p>
      <i>5 Minutes interval</i>
            {APIData && <LineChart
              width={1000}
              height={400}
              data={APIData}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[getYmin(APIData), getYmax(APIData)]} tick={false}  />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="open" stroke="red"  strokeWidth={1} dot={false}/> 
              <Line type="monotone" dataKey="close" stroke="grey " strokeWidth={1} dot={false}/> 
            </LineChart> }
    </div>
  </>
}

export default App;