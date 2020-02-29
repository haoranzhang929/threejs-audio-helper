import React from "react";
import { ResponsiveLine, Serie } from "@nivo/line";

const LineChart = ({ data }: { data: Serie[] }) => {
  return (
    <ResponsiveLine
      data={data}
      margin={{ top: 20, right: 80, bottom: 20, left: 60 }}
      xScale={{ type: "linear", min: 0, max: "auto" }}
      yScale={{ type: "linear", min: 0, max: 260 }}
      curve={"catmullRom" as "linear"}
      axisTop={null}
      axisRight={null}
      axisBottom={null}
      axisLeft={{
        orient: "left",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "level",
        legendOffset: -40,
        legendPosition: "middle"
      }}
      colors="hsl(207.9,79.2%,28.2%)"
      enablePoints={false}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1
              }
            }
          ]
        }
      ]}
    />
  );
};

export default LineChart;
