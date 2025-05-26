// 地图加载示例
d3.json("data/countries.geojson").then(function(geoData) {
  const width = 960, height = 500;
  const svg = d3.select("#map").append("svg")
                .attr("width", width)
                .attr("height", height);

  const projection = d3.geoMercator().fitSize([width, height], geoData);
  const path = d3.geoPath().projection(projection);

  svg.selectAll("path")
     .data(geoData.features)
     .enter().append("path")
     .attr("d", path)
     .attr("fill", "#ddd")
     .attr("stroke", "#333")
     .on("click", function(event, d) {
        d3.csv("data/economy.csv").then(function(data) {
            const countryData = data.find(row => row.country === d.properties.name);
            if (countryData) {
                d3.select("#economy").html(`
                  <h3>${countryData.country}</h3>
                  <p>GDP: ${countryData.gdp}</p>
                  <p>科研投入: ${countryData.research_spending}</p>
                  <p>人口: ${countryData.population}</p>
                `);
            }
        });
     });
});

// 科学网络图加载示例（简化）
d3.json("data/science_division.json").then(function(data) {
  const width = 960, height = 500;
  const svg = d3.select("#network").append("svg")
                .attr("width", width)
                .attr("height", height);

  const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));

  const link = svg.append("g")
      .selectAll("line")
      .data(data.links)
      .enter().append("line")
      .attr("stroke", "#aaa");

  const node = svg.append("g")
      .selectAll("circle")
      .data(data.nodes)
      .enter().append("circle")
      .attr("r", 5)
      .attr("fill", "#69b3a2")
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  node.append("title").text(d => d.id);

  simulation.on("tick", () => {
    link.attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node.attr("cx", d => d.x)
        .attr("cy", d => d.y);
  });

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
});

// 历史事件加载示例
d3.json("data/history_events.json").then(events => {
  const ul = d3.select("#history-events");
  ul.selectAll("li")
    .data(events)
    .enter()
    .append("li")
    .text(d => `${d.year}: ${d.event}`);
});
