import {
  Autocomplete,
  Container,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

interface ICity {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1: string;
}

interface ITemperature {
  date: string;
  temp: number;
}

const App = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [city, setCity] = useState<ICity | null>(null);
  const [cityList, setCityList] = useState<readonly ICity[]>([]);
  const [latitude, setLatitude] = useState<Number>();
  const [longitude, setLongitude] = useState<Number>();
  const [temperaturesList, setTemperaturesList] = useState<ITemperature[]>([]);
  const [currentTemperature, setCurrentTemperature] = useState<number>();

  //TODO rework both fetches and create a custom hook for it
  useEffect(() => {
    let active = true;

    if (inputValue === "") {
      setCityList(city ? [city] : []);
      return undefined;
    }

    fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + inputValue)
      .then((response) => response.json())
      .then((data) => {
        if (active) {
          let newCities: readonly ICity[] = [];

          if (city) {
            newCities = [city];
          }

          if (data.results !== undefined) {
            newCities = [...newCities, ...data.results];
          }

          setCityList(newCities);
        }
      });

    setLatitude(city?.latitude);
    setLongitude(city?.longitude);

    return () => {
      active = false;
    };
  }, [inputValue, city]);

  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=" +
        latitude +
        "&longitude=" +
        longitude +
        "&hourly=temperature_2m"
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((data) => {
        if (data !== undefined) {
          let newTemps = data.hourly.time.map((key: string, value: number) => ({
            date: key,
            temp: data.hourly.temperature_2m[value],
          }));
          setTemperaturesList(newTemps);
        }
      });
  }, [latitude, longitude]);

  // TODO should be located close to the custom hook
  function getCurrentTemperature(
    temperaturesList: ITemperature[],
    currentTime: string
  ) {
    let currentTemp = temperaturesList.filter((valuePair) => {
      return valuePair.date === currentTime;
    });
    return currentTemp;
  }

  useEffect(() => {
    let a = getCurrentTemperature(temperaturesList, "2023-03-21T12:00");
    setCurrentTemperature(a.find((x) => x !== undefined)?.temp);
  }, [temperaturesList]);

  const boxStyles = {
    background: "#fdfdfd",
    marginTop: "10rem",
    textAlign: "center",
    color: "#222",
    minHeight: "15rem",
    borderRadius: 2,
    padding: "4rem 2rem",
    boxShadow: "0px 10px 15px -3px rgba(0, 0, 0, 0.2)",
    position: "relative",
  };

  return (
    <Container maxWidth="md" sx={boxStyles}>
      <Grid container spacing={3}>
        {/* TODO add logic of Autocomplete to a separate component under components folder */}
        <Grid item xs={12}> 
          <Autocomplete
            id="search-cities"
            fullWidth
            disablePortal
            filterOptions={(x) => x}
            onChange={(event: any, newValue: ICity | null, reason) => {
              setCityList(newValue ? [newValue, ...cityList] : cityList);
              setCity(newValue);
              if (reason === "clear") {
                setLatitude(undefined);
                setLongitude(undefined);
                setCurrentTemperature(undefined);
              }
            }}
            onInputChange={(event, newInputValue) => {
              setInputValue(newInputValue);
            }}
            options={cityList}
            getOptionLabel={(cityList) =>
              `${cityList.name}, ${cityList.admin1}, ${cityList.country}`
            }
            noOptionsText="No locations"
            renderOption={(props, cityList) => {
              return (
                <li {...props} key={cityList.id}>
                  {`${cityList.name}, ${cityList.country}`}
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField {...params} label="Add a location" />
            )}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Latitude"
            value={latitude || ""}
            fullWidth
            InputProps={{
              type: "tel",
              readOnly: true,
            }}
          ></TextField>
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Longitude"
            value={longitude || ""}
            fullWidth
            InputProps={{
              type: "tel",
              readOnly: true,
            }}
          ></TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Current temperature (ºC)"
            value={currentTemperature || ""}
            fullWidth
            InputProps={{
              type: "tel",
              readOnly: true,
            }}
          ></TextField>
        </Grid>
      </Grid>
    </Container>
  );
};

export default App;
