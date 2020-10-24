import React, { useState, useEffect } from "react";
import "./App.css";
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import InfoBox from "./components/InfoBox/index";
import LineGraph from "./components/LineGraph";
import Table from "./components/Table/index";
import { sortData, prettyPrintStat } from "./util";
import numeral from "numeral";
import Map from "./components/Map/index";
import "leaflet/dist/leaflet.css";
import BarChart from "./components/BarChart/index";


const App = () => {
  const [country, setInputCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [countries, setCountries] = useState([]);
  const [casesPerMillion, setCasesPerMillion] = useState([]);
  const [mapCountries, setMapCountries] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));
          let sortedByCases = sortData(data, 'cases');

          let mostCasesPerMillionCountries = sortData(data, 'casesPerOneMillion');
          let structuredCasesPerMillion = mostCasesPerMillionCountries.slice(0,10).map((country) => ({
            name: country.country,
            casesPerMillion: country.casesPerOneMillion
          }));

          setCountries(countries);
          setCasesPerMillion(structuredCasesPerMillion);
          setMapCountries(data);
          setTableData(sortedByCases);
        });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (e) => {
    const countryCode = e.target.value;

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {

        const coordinates = data.countryInfo ? [data.countryInfo.lat, data.countryInfo.long] : ['51.260197', '4.402771'];
        
        setInputCountry(countryCode);
        setCountryInfo(data);
        setMapCenter(coordinates);
        setMapZoom(4);
      });
  };

  return (
    <div className="app">
      <div className="app__container">
        <div className="app__left">
          <div className="app__header">
            <h1>COVID Tracker</h1>
            <FormControl className="app__dropdown">
              <Select
                variant="outlined"
                value={country}
                onChange={onCountryChange}
              >
                <MenuItem value="worldwide">Worldwide</MenuItem>
                {countries.map((country, index) => (
                  <MenuItem key={index} value={country.value}>{country.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <div className="app__stats">
            <InfoBox
              onClick={(e) => setCasesType("cases")}
              title="Coronavirus Cases"
              isRed
              active={casesType === "cases"}
              cases={prettyPrintStat(countryInfo.todayCases)}
              total={numeral(countryInfo.cases).format("0.0a")}
            />
            <InfoBox
              onClick={(e) => setCasesType("recovered")}
              title="Recovered"
              active={casesType === "recovered"}
              cases={prettyPrintStat(countryInfo.todayRecovered)}
              total={numeral(countryInfo.recovered).format("0.0a")}
            />
            <InfoBox
              onClick={(e) => setCasesType("deaths")}
              title="Deaths"
              isRed
              active={casesType === "deaths"}
              cases={prettyPrintStat(countryInfo.todayDeaths)}
              total={numeral(countryInfo.deaths).format("0.0a")}
            />
          </div>
          <Map
            countries={mapCountries}
            casesType={casesType}
            center={mapCenter}
            zoom={mapZoom}
          />
        </div>
        <div className="app__right">
          <Card>
            <CardContent>
              <div className="app__information">
                <h3>Worldwide new {casesType}</h3>
                <LineGraph casesType={casesType} />
                <h3>Live cases by country</h3>
                <Table countries={tableData} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <BarChart countries={casesPerMillion} />
    </div>
  );
};

export default App;