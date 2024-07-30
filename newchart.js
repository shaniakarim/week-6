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
    jsonQuery.query[2].selection.values = ["vm01"];
    const birth = await getData();
    jsonQuery.query[2].selection.values = ["vm11"];
    const death = await getData();
    if (!birth || !death) return;

    const labels = Object.values(birth.dimension.Vuosi.category.label);
    const birthValues = birth.value;
    const deathValues = death.value;

    const chartData = {
        labels,
        datasets: [
            { name: "Births", values: birthValues },
            { name: "Deaths", values: deathValues }
        ]
    };

    new frappe.Chart("#chart", {
        title: "Births and Deaths in Finland",
        data: chartData,
        type: 'bar',
        height: 450,
        colors: ['#63d0ff', '#363636']
    });
};

buildChart();
