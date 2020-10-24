import { Card, CardContent } from '@material-ui/core';
import React, { useEffect, useState } from 'react'
import { Bar } from "react-chartjs-2";
import './style.css';

const BarChart = ({countries}) => {

  const [chartLabels, setChartLabels] = useState ([]);
  const [chartData, setChartData] = useState ([]);
  
  const convertData = (countries) => {
    let labels = []
    let data = []
    countries.map(country => {
      labels.push(country.name);
      data.push(country.casesPerMillion)
    
    });
    setChartLabels(labels);
    setChartData(data);
  };

  useEffect (()=>{
    convertData(countries)
  },[countries]);


  const barChartData = {
  labels: [...chartLabels],
  datasets: [
    {
      label: 'cases per one million',
      backgroundColor: 'rgba(255,102,0, .2)',
      borderColor: 'rgba(255,102,0, .8)',
      borderWidth: 1,
      hoverBackgroundColor: 'rgba(255,102,0, .4)',
      hoverBorderColor:'rgba(255,102,0, 1))',
      data: [...chartData],
    }
  ]
};

  const options = {legend:{display: false}}

  return (
    <Card className = "barChart">
      <CardContent>
        <h3 className = "barChart__title">countries with most cases per one million people</h3>
        <Bar
            data={barChartData}
            options = {options}
        />
      </CardContent>
    </Card>
  )
}

export default BarChart
