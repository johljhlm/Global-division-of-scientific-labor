let geographicData;
let isGeographicLoaded = false;
let economicData_GDP;
let economicData_PPP;
let economicData_ECI;
let economicData_Income;
let economicData_Income_long;
let papersData_full;
let papersData_corr;
let papersData_frac;
let papersData_diversity;
let papersData_rca;
let papersData_matrix;
let papersData_matrix_H;
let papersData_matrix_L;
let papersData_matrix_LM;
let papersData_matrix_UM;
let clusters ;
let papersData_discipline;
let specialty_sum_LM ={};
let specialty_sum_UM ={};
let specialty_sum_H ={};
let specialty_sum_L ={};
// d3 v7 加载数据方式：使用 Promise
async function loadGeographic() {
  try {
    const data = await d3.csv("../data/data_country_region_cleaned.csv");
    geographicData = data;
    console.log("国家数据:", data);
  } catch (error) {
    console.error("加载国家数据失败:", error);
  }
}

async function loadEconomic() {
  try {
    economicData_GDP = await d3.csv("../data/data_gdp_clean_long.csv");
    console.log("GDP 数据:", economicData_GDP);

    economicData_PPP = await d3.csv("../data/data_ppp_clean_long.csv");
    console.log("GDP PPP 数据:", economicData_PPP);

    economicData_Income = await d3.csv("../data/income_group.csv");
    console.log("收入等级:", economicData_Income);
    economicData_Income_long = await d3.csv("../data/data_income_group_long.csv");
    console.log("收入等级:", economicData_Income_long);

    economicData_ECI = await d3.csv("../data/ECI_Ranking.csv");
    console.log("ECI 数据:", economicData_ECI);
  } catch (error) {
    console.warn("加载经济数据失败:", error);
  }
}

async function loadPapers(callback) {
  try {
    const [rca, diversity, matrix, discipline,matrix_H,matrix_UM,matrix_LM,matrix_L] = await Promise.all([
      d3.csv("../data/filted_df5.csv"),
      d3.csv("../data/country_year_diversity.csv"),
      d3.csv("../data/specialty_proximity_matrix.csv"),
      d3.csv("../data/discipline_classification.csv"),
      d3.csv("../data/specialty_proximity_matrix_H.csv"),
      d3.csv("../data/specialty_proximity_matrix_UM.csv"),
      d3.csv("../data/specialty_proximity_matrix_LM.csv"),
      d3.csv("../data/specialty_proximity_matrix_L.csv")
      
    ]);
    console.log("matris_H 数据:", matrix_H);
    papersData_rca = rca;
    papersData_diversity = diversity;

    papersData_matrix = {};
    let headers = Object.keys(matrix[0]).slice(1);
    matrix.forEach(row => {
      const sourceName = row[""];
      if (!sourceName) return;
      papersData_matrix[sourceName] = {};
      headers.forEach(targetName => {
        const value = parseFloat(row[targetName]);
        if (!isNaN(value) && value > 0) {
          papersData_matrix[sourceName][targetName] = value;
        }
      });
    });
    console.log("papersData_matrix:", papersData_matrix);
    papersData_matrix_H = {};
    headers = Object.keys(matrix_H[0]).slice(1);
    matrix_H.forEach(row => {
      const sourceName = row[""];
      if (!sourceName) return;
      papersData_matrix_H[sourceName] = {};
      headers.forEach(targetName => {
        const value = parseFloat(row[targetName]);
        if (!isNaN(value) && value > 0) {
          papersData_matrix_H[sourceName][targetName] = value;
        }
      });
    });
    console.log("papersData_matrix_H:", papersData_matrix_H);
    papersData_matrix_UM = {};
    headers = Object.keys(matrix_UM[0]).slice(1);
    matrix_UM.forEach(row => {
      const sourceName = row[""];
      if (!sourceName) return;
      papersData_matrix_UM[sourceName] = {};
      headers.forEach(targetName => {
        const value = parseFloat(row[targetName]);
        if (!isNaN(value) && value > 0) {
          papersData_matrix_UM[sourceName][targetName] = value;
        }
      });
    });
    console.log("papersData_matrix_UM:", papersData_matrix_UM);
    papersData_matrix_LM = {};
    headers = Object.keys(matrix_LM[0]).slice(1);
    matrix_LM.forEach(row => {
      const sourceName = row[""];
      if (!sourceName) return;
      papersData_matrix_LM[sourceName] = {};
      headers.forEach(targetName => {
        const value = parseFloat(row[targetName]);
        if (!isNaN(value) && value > 0) {
          papersData_matrix_LM[sourceName][targetName] = value;
        }
      });
    });
    console.log("papersData_matrix_LM:", papersData_matrix_LM);
    papersData_matrix_L = {};
    headers = Object.keys(matrix_L[0]).slice(1);
    matrix_L.forEach(row => {
      const sourceName = row[""];
      if (!sourceName) return;
      papersData_matrix_L[sourceName] = {};
      headers.forEach(targetName => {
        const value = parseFloat(row[targetName]);
        if (!isNaN(value) && value > 0) {
          papersData_matrix_L[sourceName][targetName] = value;
        }
      });
    });
    console.log("papersData_matrix_L:", papersData_matrix_L);

    papersData_discipline = discipline.map(d => ({
      abbrev: d.abbrev,
      level_1: d.level_1,
      level_2: d.level_2,
      level_3: d.level_3
    }));
    clusters = await d3.json("../data/clusters.json");

    d3.csv('../data/specialty_sum_H.csv').then(data => {
    // data 是数组，元素是 {specialty: "Acoustics", Papers_sum: "62201"} 字符串类型

    // 转成对象： specialty_sum_H = { specialty: Papers_sum (数字) }
    
    data.forEach(d => {
      specialty_sum_H[d.specialty] = +d.Papers_sum;  // 转成数字
    });});
        d3.csv('../data/specialty_sum_L.csv').then(data => {
    // data 是数组，元素是 {specialty: "Acoustics", Papers_sum: "62201"} 字符串类型

    // 转成对象： specialty_sum_H = { specialty: Papers_sum (数字) }
    
    data.forEach(d => {
      specialty_sum_L[d.specialty] = +d.Papers_sum;  // 转成数字
    });});
        d3.csv('../data/specialty_sum_UM.csv').then(data => {
    // data 是数组，元素是 {specialty: "Acoustics", Papers_sum: "62201"} 字符串类型

    // 转成对象： specialty_sum_H = { specialty: Papers_sum (数字) }
    
    data.forEach(d => {
      specialty_sum_UM[d.specialty] = +d.Papers_sum;  // 转成数字
    });});
        d3.csv('../data/specialty_sum_LM.csv').then(data => {
    // data 是数组，元素是 {specialty: "Acoustics", Papers_sum: "62201"} 字符串类型

    // 转成对象： specialty_sum_H = { specialty: Papers_sum (数字) }
    
    data.forEach(d => {
      specialty_sum_LM[d.specialty] = +d.Papers_sum;  // 转成数字
    });});

    if (callback) callback();
  } catch (error) {
    console.warn("加载论文数据失败:", error);
  }
}



// 绘制地理图像
function drawGeographic() {
  // 这里假设使用 d3 v7，支持 Promise + async/await
(async function () {
    // 宽高设定，统一用
    const width = 500;
    const height = 350;

    // 地图投影
    const projection = d3.geoMercator()
        .scale(70)
        .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);




    // 读取数据
    const [world, data] = await Promise.all([
        d3.json("../data/world.json"),          // 地理json
        d3.csv("../data/RCA.csv")       // 数据csv
    ]);

    // 过滤只要Botany的部分（根据示例，若需要筛选不同Discipline可以调）
    const filteredData = data.filter(d => d.Discipline === "Biology" && d.Specialty === "Botany");

    // 找最大最小RCA_Specialty，用于颜色比例尺domain
    const rcaValues = filteredData.map(d => +d.RCA_Specialty);
    const maxRCA = d3.max(rcaValues);
    const minRCA = d3.min(rcaValues);
    // 颜色比例尺
    // const colorScale = d3.scaleSequential()
    //     .interpolator(d3.interpolateViridis)  // 新配色
    //     .clamp(true)
    //     .domain([minRCA, maxRCA]);
    const colorScale = d3.scaleLinear()
        .domain([minRCA, maxRCA])
        .range(["#e0f3dc", "#43a2ca"]); // 浅绿到深蓝


    // 将数据按年份分组，方便4张图使用
    const dataByYear = d3.group(filteredData, d => d.Year);

    // world.json 的处理：
    // 假设是GeoJSON格式，如果是TopoJSON，需转换：
    // const countries = topojson.feature(world, world.objects.countries).features;
    // 这里示例按GeoJSON
    const countries = world.features;
    function drawLegend(containerId, colorScale, minVal, maxVal) {
        const legendWidth = 140;
        const legendHeight = 20;

        const canvas = d3.select(`#${containerId}`)
            .append("canvas")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("width", legendWidth + "px")
            .style("height", legendHeight + "px");

        const ctx = canvas.node().getContext("2d");

        // 画渐变色条
        const image = ctx.createImageData(legendWidth, legendHeight);
        for (let i = 0; i < legendWidth; ++i) {
            const c = d3.rgb(colorScale(minVal + (i / legendWidth) * (maxVal - minVal)));
            for (let j = 0; j < legendHeight; ++j) {
                const index = 4 * (j * legendWidth + i);
                image.data[index] = c.r;
                image.data[index + 1] = c.g;
                image.data[index + 2] = c.b;
                image.data[index + 3] = 255;
            }
        }
        ctx.putImageData(image, 0, 0);

        // 用svg加刻度文字
        const svg = d3.select(`#${containerId}`)
            .append("svg")
            .attr("width", legendWidth)
            .attr("height", 30);

        const scale = d3.scaleLinear()
            .domain([minVal, maxVal])
            .range([0, legendWidth]);

        const axisBottom = d3.axisBottom(scale)
            .ticks(5)
            .tickFormat(d3.format(".2f"));

        svg.append("g")
            .attr("transform", "translate(0,10)")
            .call(axisBottom);
    }

    // 调用颜色条绘制函数
    drawLegend("legend", colorScale, minRCA, maxRCA);

    // 画图函数
    function drawMap(containerId, year) {
        // drawMap函数中
        const svg = d3.select(`#${containerId}`)
            .append("svg")
            .attr("width", "100%")      // 宽度改为100%适应父容器
            .attr("height", height);    // 高度保持固定350


        // 获取当年数据，变成Map，key是国家名，value是RCA_Specialty
        const yearData = dataByYear.get(year.toString()) || [];
        const rcaMap = new Map(yearData.map(d => [d.Country, +d.RCA_Specialty]));

        // 绘制国家路径
        svg.selectAll("path")
            .data(countries)
            .join("path")
            .attr("d", path)
            .attr("fill", d => {
                // 国家名字字段，可能叫 properties.name 或 properties.ADMIN，视json结构调整
                const countryName = d.properties.name || d.properties.ADMIN || "";
                const val = rcaMap.get(countryName);
                return val != null ? colorScale(val) : "#eee"; // 无数据国家填灰
            })
            .attr("stroke", "#999")
            .attr("stroke-width", 0.5)
            .on("mouseover", function (event, d) {
                const countryName = d.properties.name || d.properties.ADMIN || "";
                const val = rcaMap.get(countryName);
                const tooltip = d3.select("#tooltip");
                tooltip
                    .style("opacity", 1)
                    // .html(`<strong>${countryName}</strong><br/>RCA: ${val != null ? val.toFixed(2) : "无数据"}`)
                    .html(`<strong>${countryName}</strong>${val != null ? `<br/>RCA: ${val.toFixed(2)}` : ""}`)

                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            .on("mouseout", function () {
                d3.select("#tooltip").style("opacity", 0);
            });

        // 标题
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", 25)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .text(year + "年");
    }

    // 四个年份循环绘图
    [2014, 2015, 2016, 2017].forEach(year => {
        drawMap("chart-" + year, year);
    });
})();

}

// 经济图像绘制
// 经济图像绘制（升级版，兼容 D3 v7）
function drawEconomic() {
  // 学科关联网络
  function drawIncome() {
    if (!papersData_discipline || !papersData_matrix_H || !papersData_matrix_UM || !papersData_matrix_LM || !papersData_matrix_L) {
      console.warn("学科分类或矩阵数据尚未加载完成");
      return;
    }
    const container = document.getElementById("incomeContainer");
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(2, 1fr)";
    container.style.gridTemplateRows = "repeat(2, auto)";
    container.style.gap = "20px";
    container.style.justifyItems = "center";
    container.style.alignItems = "center";

    
    const svg1 = d3.select("#svg-high")
  .attr("viewBox", "0 0 1000 800")
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "100%");

const svg2 = d3.select("#svg-upper-middle")
  .attr("viewBox", "0 0 1000 800")
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "100%");

const svg3 = d3.select("#svg-lower-middle")
  .attr("viewBox", "0 0 1000 800")
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "100%");

const svg4 = d3.select("#svg-low")
  .attr("viewBox", "0 0 1000 800")
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "100%");


    svg1.selectAll("*").remove();
    svg2.selectAll("*").remove();
    svg3.selectAll("*").remove();
    svg4.selectAll("*").remove();

async function drawNetwork(svg, papersData_matrix_Income, specialty_sum_Income,Name) {
  const width = +svg.attr("width");
  const height = +svg.attr("height");

  const nodes = [];
  const clusterCenters = {};
  const clusterMap = {}; // cluster -> 节点名数组
  const disciplineMap = {}; // discipline -> true，用于着色

  papersData_discipline.forEach((row, index) => {
    const name = row.level_1;
    const discipline = row.level_3;
    const cluster = clusters[name];

    if (!name || cluster === undefined || !discipline) return;

    nodes.push({
      id: index,
      name,
      cluster,
      discipline
    });

    if (!clusterMap[cluster]) clusterMap[cluster] = [];
    clusterMap[cluster].push(name);

    if (!disciplineMap[discipline]) disciplineMap[discipline] = true;
  });

  const idMap = {};
  nodes.forEach((node, index) => {
    idMap[node.name] = index;
  });

  const links = [];
  Object.keys(papersData_matrix_Income).forEach(sourceName => {
    const sourceIndex = idMap[sourceName];
    if (sourceIndex === undefined) return;

    const connections = Object.entries(papersData_matrix_Income[sourceName])
      .filter(([targetName, value]) => {
        const targetIndex = idMap[targetName];
        return (
          !isNaN(value) &&
          parseFloat(value) > 0.5 &&
          targetIndex !== undefined &&
          targetIndex !== sourceIndex
        );
      })
      .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]))
      .slice(0, 5);

    connections.forEach(([targetName, value]) => {
      links.push({
        source: nodes[sourceIndex],
        target: nodes[idMap[targetName]],
        value: parseFloat(value)
      });
    });
  });

  // 过滤孤立节点（有边相连的）
  const connectedIds = new Set();
  links.forEach(link => {
    connectedIds.add(link.source.id);
    connectedIds.add(link.target.id);
  });
  const filteredNodes = nodes.filter(n => connectedIds.has(n.id));

  // 聚类中心计算
  const clusterKeys = Object.keys(clusterMap);
  const angleStep = 2 * Math.PI / clusterKeys.length;
  const clusterRadius = 250;
  clusterKeys.forEach((key, i) => {
    const angle = i * angleStep;
    clusterCenters[key] = {
      x: width / 2 + clusterRadius * Math.cos(angle),
      y: height / 2 + clusterRadius * Math.sin(angle)
    };
  });

  // 节点初始位置靠近聚类中心
  filteredNodes.forEach(d => {
    const center = clusterCenters[d.cluster];
    d.x = center.x + Math.random() * 80 - 40;
    d.y = center.y + Math.random() * 80 - 40;
  });

  // 准备颜色映射
  const disciplineKeys = Object.keys(disciplineMap);
  const color = d3.scaleOrdinal().domain(disciplineKeys).range(d3.schemeCategory10);

  // 计算 Papers_sum 的最小最大值用于比例尺
  const paperCounts = Object.values(specialty_sum_Income);
  const minPapers = d3.min(paperCounts);
  const maxPapers = d3.max(paperCounts);

  // 半径比例尺，sqrt scale 符合面积感知
  const radiusScale = d3.scaleSqrt()
    .domain([minPapers, maxPapers])
    .range([4, 20]);  // 可根据需要调整最小最大半径

  // 画边
  const link = svg.selectAll(".link")
    .data(links)
    .join("line")
    .attr("class", "link")
    .style("stroke", "#ccc")
    .style("stroke-width", d => Math.max(0.5, d.value * 1.5))
    .style("opacity", 0.3);

  // 画节点，半径根据 specialty_sum_Income 中对应学科 Papers_sum 设置
  const node = svg.selectAll(".node")
    .data(filteredNodes)
    .join("circle")
    .attr("class", "node")
    .attr("r", d => {
      const papers = specialty_sum_Income[d.name] || minPapers;
      return radiusScale(papers);
    })
    .style("fill", d => color(d.discipline))
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  node.append("title")
    .text(d => `${d.name}\nDiscipline: ${d.discipline}\nPapers_sum: ${specialty_sum_Income[d.name] || "未知"}`);

  // 聚类标签
  svg.selectAll(".cluster-label")
    .data(clusterKeys)
    .join("text")
    .attr("class", "cluster-label")
    .attr("x", d => clusterCenters[d].x)
    .attr("y", d => clusterCenters[d].y)
    .attr("text-anchor", "middle")
    .attr("dy", "-1em")
    .style("font-weight", "bold")
    .style("fill", "#333")
    //.text(d => `Cluster ${d}`);

  // 力模拟
  const simulation = d3.forceSimulation(filteredNodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(80))
    .force("charge", d3.forceManyBody().strength(-100))
    .force("center", d3.forceCenter(1000 / 2, 800 / 2))
    .force("collision", d3.forceCollide(d => {
      const papers = specialty_sum_Income[d.name] || minPapers;
      return radiusScale(papers) + 3;
    }))
    .force("clustering", () => {
      filteredNodes.forEach(d => {
        const center = clusterCenters[d.cluster];
        const strength = 0.05;
        d.vx += (center.x - d.x) * strength;
        d.vy += (center.y - d.y) * strength;
      });
    })
    .on("tick", ticked);
  function centerGraph() {
  const minX = d3.min(filteredNodes, d => d.x);
  const maxX = d3.max(filteredNodes, d => d.x);
  const minY = d3.min(filteredNodes, d => d.y);
  const maxY = d3.max(filteredNodes, d => d.y);

  const graphWidth = maxX - minX;
  const graphHeight = maxY - minY;

  const offsetX = width / 2 - (minX + graphWidth / 2) + 500;
  const offsetY = height / 2 - (minY + graphHeight / 2) +450;

  filteredNodes.forEach(d => {
    d.x += offsetX;
    d.y += offsetY;
  });
}

  // 预运行模拟步数，保证初始布局
  for (let i = 0; i < 100; i++) simulation.tick();
  simulation.stop();  // 停止后节点不再抖动
 
  centerGraph();  // ⬅️ 居中这个 SVG 中的图形


  ticked();



  function ticked() {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);
  }
  
  // tooltip 选择器，确保页面存在<div id="tooltip"></div>
  const tooltip = d3.select("#tooltip");

  // 拖拽事件
function dragstarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();

  // 保存原始位置
  d._originalX = d.x;
  d._originalY = d.y;

  // 锁定其他节点
  filteredNodes.forEach(node => {
    if (node.id !== d.id) {
      node.fx = node.x;
      node.fy = node.y;
    }
  });

  d.fx = d.x;
  d.fy = d.y;

  // 获取连接边和邻居节点
  const connectedLinks = links.filter(l => l.source.id === d.id || l.target.id === d.id);
  const connectedNodes = connectedLinks.map(l => (l.source.id === d.id ? l.target : l.source));

  // 构造 tooltip
  let tooltipHTML = `<b>${d.name}</b><br>学科: ${d.discipline}<br>论文数: ${specialty_sum_Income[d.name] || '未知'}<br><br>`;
  //tooltipHTML += `<b>连接边权重和邻居学科:</b><br>`;
  connectedLinks.forEach(l => {
    const neighbor = (l.source.id === d.id) ? l.target : l.source;
    //tooltipHTML += `${neighbor.name} (${neighbor.discipline}): 权重 ${l.value.toFixed(2)}<br>`;
  });

  tooltip.style("display", "block")
    .html(tooltipHTML)
    .style("left", (event.sourceEvent.pageX + 10) + "px")
    .style("top", (event.sourceEvent.pageY + 10) + "px");

  // 添加边权重文字

  
 

  //svg.selectAll(".link-label").remove(); // 清除旧的
  //svg.selectAll(".link-label")
  //  .data(connectedLinks)
  //  .enter()
  //  .append("text")
  //  .attr("class", "link-label")
  //  .attr("x", l => (l.source.x + l.target.x) / 2 + (l.target.y - l.source.y) * 0.05)
  //  .attr("y", l => (l.source.y + l.target.y) / 2 - (l.target.x - l.source.x) * 0.05)
  //  .text(l => l.value.toFixed(2))
  //  .style("font-size", "11px")
  //  .style("fill", "#666")
  //  .style("pointer-events", "none");

  // 添加邻居节点名称
  svg.selectAll(".neighbor-label").remove(); // 清除旧的
  svg.selectAll(".neighbor-label")
    .data(connectedNodes)
    .enter()
    .append("text")
    .attr("class", "neighbor-label")
    .attr("x", n => n.x -50)
    .attr("y", n => n.y - 10)
    .text(n => n.name)
    .style("font-size", "18px")
    .style("fill", "#333")
    .style("pointer-events", "none");

  // 边高亮
  link.style("stroke-width", l =>
    (l.source.id === d.id || l.target.id === d.id) ? Math.max(2, l.value * 5) : Math.max(0.5, l.value * 1.5)
  ).style("stroke-opacity", l =>
    (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.3
  );

  // 节点高亮
  node.style("opacity", n =>
    (n.id === d.id || connectedNodes.some(cn => cn.id === n.id)) ? 1 : 0.3
  );
}


function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;

  tooltip.style("left", (event.sourceEvent.pageX + 10) + "px")
    .style("top", (event.sourceEvent.pageY + 10) + "px");
}

function dragended(event, d) {
  if (!event.active) simulation.alphaTarget(0);

  d.fx = d._originalX;
  d.fy = d._originalY;

  tooltip.style("display", "none");

  // 清除文字
  svg.selectAll(".link-label").remove();
  svg.selectAll(".neighbor-label").remove();

  // 恢复样式
  link.style("stroke-width", d => Math.max(0.5, d.value * 1.5))
      .style("stroke-opacity", 0.3);
  node.style("opacity", 1);
}
// 添加图表标题
svg.append("text")
  .attr("x", width+500)
  .attr("y", 40)
  .attr("text-anchor", "middle")
  .attr("class", "chart-title")
  .style("font-size", "30px")
  .style("font-weight", "bold")
  .text("关联学科网络图（" +Name+ "）");
  // 添加集群名称
svg.append("text")
  .attr("x", width+100)
  .attr("y", 200)
  .attr("text-anchor", "middle")
  .attr("class", "chart-title")
  .style("font-size", "30px")
 
  .text("物理集群");

svg.append("text")
  .attr("x", width+150)
  .attr("y", 600)
  .attr("text-anchor", "middle")
  .attr("class", "chart-title")
  .style("font-size", "30px")
  
  .text("社会集群");
svg.append("text")
  .attr("x", width+900)
  .attr("y", 400)
  .attr("text-anchor", "middle")
  .attr("class", "chart-title")
  .style("font-size", "30px")
 
  .text("自然集群");
// 添加图例
const legend = svg.append("g")
  .attr("class", "legend")
  .attr("transform", `translate(800, 100)`);

const legendSpacing = 20;

disciplineKeys.forEach((discipline, i) => {
  const row = legend.append("g")
    .attr("transform", `translate(0, ${i * legendSpacing})`);

  row.append("rect")
    .attr("width", 14)
    .attr("height", 14)
    .attr("fill", color(discipline));
// 准备颜色映射

  row.append("text")
    .attr("x", 20)
    .attr("y", 14)
    .text(discipline)
    .style("font-size", "24px")
    .style("fill", "#333");
});


}




  console.log(papersData_matrix_H);
  console.log(papersData_matrix_L);

  drawNetwork(svg1, papersData_matrix_H,specialty_sum_H,"高收入国家");
  drawNetwork(svg2, papersData_matrix_UM,specialty_sum_UM,"中高收入国家");
  drawNetwork(svg3, papersData_matrix_LM, specialty_sum_LM,"中低收入国家");
  drawNetwork(svg4, papersData_matrix_L, specialty_sum_L,"低收入国家");
  
}
  drawIncome();

  

  // 按收入等级绘制 学科多样性 趋势

function drawIncomePeriodSummaryScatter() {
  d3.select("#lineChartContainer").html("");

  const margin = { top: 30, right: 30, bottom: 40, left: 200 };
  const width = 800 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const svg = d3.select("#lineChartContainer").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const incomeMap = {};
  economicData_Income.forEach(row => {
    const code = row.Code;
    incomeMap[code] = {};
    Object.keys(row).forEach(k => {
      if (k !== "Code") incomeMap[code][k] = row[k];
    });
  });

  const getPeriod = year => {
    const start = Math.floor((year - 1990) / 5) * 5 + 1990;
    return `${start}-${start + 4}`;
  };

  const incomeTypes = ["L", "LM", "UM", "H"];
  const incomeLabels = {
    L: "Low",
    LM: "Lower-Middle",
    UM: "Upper-Middle",
    H: "High"
  };

  const groupData = {};

  papersData_diversity.forEach(d => {
    const year = +d.Year;
    if (isNaN(year) || year < 1990) return;

    const country = d.Country;
    const diversity = +d.Diversity;
    if (isNaN(diversity)) return;

    const code = Object.keys(incomeMap).find(c =>
      country.toLowerCase().includes(c.toLowerCase())
    );
    if (!code || !incomeMap[code][year]) return;

    const income = incomeMap[code][year];
    if (!incomeTypes.includes(income)) return;

    const period = getPeriod(year);
    const key = `${income}_${period}`;

    if (!groupData[key]) groupData[key] = { income, period, values: [] };
    groupData[key].values.push(diversity);
  });

  const summaryData = [];

  Object.entries(groupData).forEach(([key, group]) => {
    const values = group.values.sort(d3.ascending);
    const mean = d3.mean(values);
    const q1 = d3.quantile(values, 0.25);
    const q3 = d3.quantile(values, 0.75);

    summaryData.push({
      key,
      income: group.income,
      incomeLabel: incomeLabels[group.income],
      period: group.period,
      mean,
      q1,
      q3
    });
  });

  // 获取所有 period 起始年，排序用于着色
  const periodYears = Array.from(new Set(summaryData.map(d => +d.period.split("-")[0]))).sort((a, b) => a - b);

  const colorScale = d3.scaleLinear()
    .domain([d3.min(periodYears), d3.max(periodYears)])
    .range(["#c6dbef", "#08306b"]); // 浅蓝 → 深蓝

  const yLabels = summaryData
    .map(d => `${d.incomeLabel} ${d.period}`)
    .sort((a, b) => {
      const [aType, aPeriod] = a.split(" ");
      const [bType, bPeriod] = b.split(" ");
      const typeOrder = incomeTypes.indexOf(getKeyByValue(incomeLabels, aType)) - incomeTypes.indexOf(getKeyByValue(incomeLabels, bType));
      if (typeOrder !== 0) return typeOrder;
      return parseInt(aPeriod) - parseInt(bPeriod);
    });

  function getKeyByValue(obj, value) {
    return Object.keys(obj).find(k => obj[k] === value);
  }

  const x = d3.scaleLinear()
    .domain([0.35, 0.75])
    .range([0, width]);

  const y = d3.scalePoint()
    .domain(yLabels)
    .range([height, 0])
    .padding(1);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .call(d3.axisLeft(y));

  // 横线（四分位数）
  svg.selectAll("line.range")
    .data(summaryData)
    .enter()
    .append("line")
    .attr("class", "range")
    .attr("x1", d => x(d.q1))
    .attr("x2", d => x(d.q3))
    .attr("y1", d => y(`${d.incomeLabel} ${d.period}`))
    .attr("y2", d => y(`${d.incomeLabel} ${d.period}`))
    .attr("stroke", d => colorScale(+d.period.split("-")[0]))
    .attr("stroke-width", 4)
    .attr("stroke-opacity", 0.9);

  // 均值点
  svg.selectAll("circle.mean")
    .data(summaryData)
    .enter()
    .append("circle")
    .attr("class", "mean")
    .attr("cx", d => x(d.mean))
    .attr("cy", d => y(`${d.incomeLabel} ${d.period}`))
    .attr("r", 6)
    .attr("fill", d => colorScale(+d.period.split("-")[0]))
    .attr("stroke", "")
    .attr("stroke-width", 1.5);
}




drawIncomePeriodSummaryScatter(); // 使用汇总散点图
}


document.addEventListener("DOMContentLoaded", function () {
  const btnGeographic = document.getElementById('btnGeographic');
  const btnEconomic = document.getElementById('btnEconomic');
  const sectionGeographic = document.getElementById('geographic-corr');
  const sectionEconomic = document.getElementById('economic-corr');

  function showSection(sectionId) {
    [sectionGeographic, sectionEconomic].forEach(sec => sec.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
  }

  // 点击切换区域并尝试绘制地图
  btnGeographic.addEventListener('click', () => {
    showSection('geographic-corr');
    if (isGeographicLoaded) {
      drawGeographic();
    } else {
      console.log("数据仍在加载中，请稍等...");
    }
  });

  

  btnEconomic.addEventListener('click', () => {
    showSection('economic-corr');
    drawEconomic();
  });

  // 默认显示第一个区域，但不立即绘制，等数据加载后再手动触发
  showSection('geographic-corr');

  // 加载所有数据
  loadPapers();
  loadEconomic();
  loadGeographic(drawGeographic); // 数据加载完成后自动绘制一次
});