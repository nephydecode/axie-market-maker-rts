import { Tab, Tabs, AppBar, Box, Typography } from "@material-ui/core";
import React, { useState, useLayoutEffect, useRef } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import "./App.css";
import { DOMMessageResponse, DOMFilterBuild } from "./types";
import SwipeableViews from "react-swipeable-views";
import FilterSetup from "./components/FilterSetup";
import AxieFiltersProvider from "./store/filters-context";
import { FiltersContext } from "./store/filters-context";
import ButtonList from "./components/ButtonList";
import { colors } from "@material-ui/core";
import BannerImage from './images/banner.png';

const initialFilterState = {};

function App(props: any) {
  const [filters, setFilters] = useState(initialFilterState);
  // const [title, setTitle] = useState("");
  // const [headlines, setHeadlines] = useState<string[]>([]);
  // const [button, setButton] = useState<boolean>(false);
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  // const useStyles = makeStyles((theme) => ({
  //   root: {
  //     backgroundColor: theme.palette.background.paper,
  //     width: 500,
  //   },
  // }));

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index: any) => {
    setValue(index);
  };

  const buttonHandler = (obj: {}) => {
    setFilters(obj);
  };

  const firstUpdate = useRef(true);
  useLayoutEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    if (
      filters && // 👈 null and undefined check
      Object.keys(filters).length === 0 &&
      filters.constructor === Object
    )
      return;

    console.log(filters);
    chrome.tabs &&
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        (tabs) => {
          /**
           * Sends a single message to the content script(s) in the specified tab,
           * with an optional callback to run when a response is sent back.
           *
           * The runtime.onMessage event is fired in each content script running
           * in the specified tab for the current extension.
           */
          chrome.tabs.sendMessage(
            tabs[0].id || 0,
            {
              type: "FILTER_BUILD",
              filterConditions: filters,
            } as DOMFilterBuild,
            (response: DOMMessageResponse) => {
              // setTitle(response.title);
              // setHeadlines(response.headlines);
            }
          );
        }
      );
    window.close();
    setFilters(initialFilterState);
  }, [filters]);

  return (
    <AxieFiltersProvider>
      <div className="App" style={{ backgroundColor: "#fff" }}>
        <img src={BannerImage} width={475}/>
        <AppBar position="static" color="default" style={{boxShadow: "none", backgroundColor: "#fff"}}>
          <Tabs value={value} onChange={handleChange} indicatorColor="primary" textColor="primary" variant="fullWidth" aria-label="full width tabs example">
            <Tab label="Market Filter" {...a11yProps(0)} />
            <Tab label="Setup" {...a11yProps(1)} />
          </Tabs>
        </AppBar>
        <SwipeableViews axis={theme.direction === "rtl" ? "x-reverse" : "x"} index={value} onChangeIndex={handleChangeIndex}>
          <TabPanel value={value} index={0} dir={theme.direction} style={{ marginBottom: 60}}>
            <ButtonList onSelectButton={buttonHandler} />
          </TabPanel>
          <TabPanel value={value} index={1} dir={theme.direction}>
            <FilterSetup />
          </TabPanel>
        </SwipeableViews>
      </div>
    </AxieFiltersProvider>
  );
}
export default App;

function a11yProps(index: any) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`scrollable-force-tabpanel-${index}`} aria-labelledby={`scrollable-force-tab-${index}`} {...other}>
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}