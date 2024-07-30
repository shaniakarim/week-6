const jsonQuery = {
    query: [
        { code: "Vuosi", selection: { filter: "item", values: ["2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021"] } },
        { code: "Alue", selection: { filter: "item", values: ["SSS"] } },
        { code: "Tiedot", selection: { filter: "item", values: ["vaesto"] } }
    ],
    response: { format: "json-stat2" }
};

const getData = async () => {
    try {
        const res = await fetch("https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jsonQuery)
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error("Failed to fetch data:", error);
    }
};

const buildChart = async () => {
    const data = await getData();
    if (!data) return;

    const labels = Object.values(data.dimension.Vuosi.category.label);
    const values = data.value;

    const chartData = {
        labels,
        datasets: [{ name: "Population", values }]
    };

    const chart = new frappe.Chart("#chart", {
        title: "Population data",
        data: chartData,
        type: "line",
        height: 450,
        colors: ["#eb5146"]
    });

    document.getElementById("add-data").addEventListener("click", () => {
        const deltas = chartData.datasets[0].values.slice(1).map((v, i) => v - chartData.datasets[0].values[i]);
        const meanDelta = deltas.reduce((sum, delta) => sum + delta, 0) / deltas.length;
        const nextValue = chartData.datasets[0].values.slice(-1)[0] + meanDelta;
        chartData.labels.push(String(Number(chartData.labels.slice(-1)[0]) + 1));
        chartData.datasets[0].values.push(nextValue.toFixed(2));
        chart.update(chartData);
    });
};

document.getElementById("submit-data").addEventListener("click", async () => {
    const inputValue = document.getElementById("input-area").value.toLowerCase();
    const response = await fetch("https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px");
    const json = await response.json();
    const areaCodes = json.variables[1].values;
    const areaNames = json.variables[1].valueTexts.map(name => name.toLowerCase());
    const areaCode = areaCodes[areaNames.indexOf(inputValue)];

    if (areaCode) {
        jsonQuery.query[1].selection.values[0] = areaCode;
        await buildChart();
    } else {
        console.error("Area code not found for the provided input.");
    }
});

document.getElementById("navigation").addEventListener("click", () => {
    window.location.href = "newchart.html";
});
