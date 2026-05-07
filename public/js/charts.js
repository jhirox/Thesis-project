document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("application-chart")) {
    Highcharts.chart("application-chart", {
      chart: {
        backgroundColor: null,
        type: "column",
      },
      title: { text: "" },
      xAxis: {
        categories: [""],
        labels: { style: { color: "#ffffff" } },
      },
      yAxis: {
        min: 0,
        title: {
          text: "Number of Applications",
          style: { color: "#ffffff" },
        },
        labels: { style: { color: "#ffffff" } },
      },
      legend: {
        itemStyle: { color: "#ffffff" },
        itemHoverStyle: { color: "#ffffff" },
      },
      credits: { enabled: false },
      exporting: { enabled: false },
      tooltip: {
        shared: true,
        formatter: formatApplicationVolumeTooltip,
      },
      plotOptions: {
        column: {
          grouping: true,
          shadow: false,
          borderWidth: 0,
        },
      },
      series: [
        {
          name: "Total Applications",
          data: [1820],
          color: "#2196f3",
        },
        {
          name: "Approved",
          data: [1180],
          color: "#4caf50",
        },
        {
          name: "Pending",
          data: [450],
          color: "#ff9800",
        },
        {
          name: "Rejected",
          data: [90],
          color: "#f44336",
        },
        {
          name: "Enrolled",
          data: [100],
          color: "#9c27b0",
        },
      ],
    });
  }

  // PIE CHART – APPLICATIONS BY COURSE
  function formatApplicationVolumeTooltip() {
    return this.points
      .map(
        (point) =>
          `<span style="color:${point.color}">\u25CF</span> ${
            point.series.name
          }: <b>${point.y} application(s)</b>`
      )
      .join("<br/>");
  }

  if (document.getElementById("application-course-chart")) {
    Highcharts.chart("application-course-chart", {
      chart: {
        backgroundColor: null,
        type: "pie",
      },
      title: { text: "" },
      credits: { enabled: false },
      exporting: { enabled: false },
      tooltip: {
        pointFormat:
          "{series.name}: <b>{point.percentage:.1f}%</b><br/>Total: <b>{point.y}</b>",
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: "pointer",
          dataLabels: {
            enabled: true,
            format: "<b>{point.name}</b>: {point.percentage:.1f} %",
          },
        },
      },
      series: [
        {
          name: "Applications",
          colorByPoint: true,
          data: [
            { name: "BSCS", y: 320 },
            { name: "BSBA", y: 210 },
            { name: "BSED English", y: 180 },
            { name: "BSED Filipino", y: 150 },
            { name: "BEED", y: 140 },
            { name: "BSCRIM", y: 120 },
            { name: "BSED Mathematics", y: 120 },
          ],
        },
      ],
    });
  }

  
  // ENROLLMENT & RETENTION TRENDS (DUAL AXIS)
  if (document.getElementById("enrollment-retention-chart")) {
    Highcharts.chart("enrollment-retention-chart", {
      chart: {
        backgroundColor: null,
        type: "column",
      },
      title: { text: "" },
      xAxis: {
        categories: [
          "Jan 2023",
          "Feb 2023",
          "Mar 2023",
          "Apr 2023",
          "May 2023",
          "Jun 2023",
          "Jul 2023",
          "Aug 2023",
          "Sep 2023",
          "Oct 2023",
          "Nov 2023",
          "Dec 2023",
          "Jan 2024",
          "Feb 2024",
          "Mar 2024",
          "Apr 2024",
          "May 2024",
          "Jun 2024",
          "Jul 2024",
          "Aug 2024",
        ],
        labels: { style: { color: "#ffffff" }, rotation: -45 },
      },
      yAxis: [
        {
          title: {
            text: "Number of Students",
            style: { color: "#ffffff" },
          },
          labels: { style: { color: "#ffffff" } },
        },
        {
          title: {
            text: "Retention Rate (%)",
            style: { color: "#ffffff" },
          },
          labels: {
            style: { color: "#ffffff" },
            format: "{value}%",
          },
          opposite: true,
          max: 100,
        },
      ],
      legend: {
        itemStyle: { color: "#ffffff" },
        itemHoverStyle: { color: "#ffffff" },
      },
      credits: { enabled: false },
      exporting: { enabled: false },
      tooltip: {
        shared: true,
        formatter: function () {
          let tooltip = `<b>${this.x}</b><br/>`;
          this.points.forEach((p) => {
            tooltip += `<span style="color:${p.color}">●</span> ${
              p.series.name
            }: <b>${
              p.series.name === "Retention Rate" ? p.y.toFixed(1) + "%" : p.y
            }</b><br/>`;
          });
          return tooltip;
        },
      },
      plotOptions: {
        column: { grouping: false, shadow: false, borderWidth: 0 },
        line: { marker: { enabled: true, radius: 4 } },
      },
      series: [
        {
          name: "New Enrollments",
          type: "column",
          data: [
            245, 280, 320, 290, 350, 380, 420, 450, 410, 390, 360, 340, 380,
            400, 430, 410, 450, 480, 510, 540,
          ],
          color: "#2196f3",
          yAxis: 0,
        },
        {
          name: "Total Enrolled",
          type: "column",
          data: [
            1245, 1525, 1845, 2135, 2485, 2865, 3285, 3735, 4145, 4535, 4895,
            5235, 5615, 6015, 6445, 6855, 7305, 7785, 8295, 8835,
          ],
          color: "#4caf50",
          yAxis: 0,
        },
        {
          name: "Retention Rate",
          type: "line",
          data: [
            85.2, 86.5, 87.1, 86.8, 88.2, 89.1, 88.7, 89.5, 90.1, 89.8, 90.3,
            91.2, 91.5, 92.1, 91.8, 92.5, 93.1, 92.8, 93.5, 94.2,
          ],
          color: "#ff9800",
          yAxis: 1,
          lineWidth: 3,
        },
      ],
    });
  }
});
