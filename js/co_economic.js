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

    economicData_PPP = await d3.csv("../data/data_ppp_clean_long_withoutNA.csv");
    console.log("GDP PPP 数据:", economicData_PPP);
    
    
    economicData_Income = await d3.csv("../data/income_group.csv");
    console.log("收入等级:", economicData_Income);
    economicData_Income_long = await d3.csv("../data/data_income_group_long.csv");
    console.log("收入等级:", economicData_Income_long);

    economicData_ECI = await d3.csv("../data/ECI_Ranking.csv");
    economicData_ECI = economicData_ECI.filter(d => +d.Year >= 1990);
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
    //container.style.display = "grid";
    //container.style.gridTemplateColumns = "repeat(2, 1fr)";
    //container.style.gridTemplateRows = "repeat(2, auto)";
    //container.style.gap = "20px";
    //container.style.justifyItems = "center";
    //container.style.alignItems = "center";

    
    const svg1 = d3.select("#svg-high")
  .attr("viewBox", "0 0 2500 1200")
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "100%");

const svg2 = d3.select("#svg-upper-middle")
  .attr("viewBox", "0 0 2500 1200")
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "100%");

const svg3 = d3.select("#svg-lower-middle")
  .attr("viewBox", "0 0 2500 1200")
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "100%");

const svg4 = d3.select("#svg-low")
  .attr("viewBox", "0 0 2500 1200")
  .attr("preserveAspectRatio", "xMidYMid meet")
  .style("width", "100%")
  .style("height", "100%");


    svg1.selectAll("*").remove();
    svg2.selectAll("*").remove();
    svg3.selectAll("*").remove();
    svg4.selectAll("*").remove();

async function drawNetwork(svg, papersData_matrix_Income, specialty_sum_Income,Name) {
  const width = 1800 //+svg.attr("width");
  const height = 600 //+svg.attr("height");

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
  const clusterRadius = 800;
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
    .range([8, 40]);  // 可根据需要调整最小最大半径

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
    .force("center", d3.forceCenter(2500 / 2  , 1200 / 2 ))
    .force("collision", d3.forceCollide(d => {
      const papers = specialty_sum_Income[d.name] || minPapers;
      return radiusScale(papers) + 3;
    }))
      .force("x", d3.forceX(width / 2).strength(0.03))
  .force("y", d3.forceY(height / 2).strength(0.03))

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
  const tooltip = d3.select("#node-info");

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
  
  // 直接使用鼠标的屏幕坐标
  const [mouseX, mouseY] = d3.pointer(event, document.body);
  
  tooltip
    .style("left", `${mouseX + 10}px`)
    .style("top", `${mouseY + 10}px`);

  //window.addEventListener("mousemove", followMouse);
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
  let tooltipHTML = `<b>${d.name}</b><br>学科: ${d.discipline}<br>论文数: ${specialty_sum_Income[d.name] || '未知'}<br><br>`;
  //tooltipHTML += `<b>连接边权重和邻居学科:</b><br>`;
 
  tooltip.style("display", "block")
    .html(tooltipHTML)


  // 直接使用鼠标的屏幕坐标
  const [mouseX, mouseY] = d3.pointer(event, document.body);
   // 注册全局鼠标移动监听（保证持续更新 tooltip 位置）
  //window.addEventListener("mousemove", followMouse);
  tooltip
    .style("left", `${mouseX + 10}px`)
    .style("top", `${mouseY + 10}px`);

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
  //window.removeEventListener("mousemove", followMouse);
}
// 添加图表标题
svg.append("text")
  .attr("x", width-500)
  .attr("y", -150)
  .attr("text-anchor", "middle")
  .attr("class", "chart-title")
  .style("font-size", "60px")
  .style("font-weight", "bold")
  .text("关联学科网络图（" +Name+ "）");
  // 添加集群名称
svg.append("text")
  .attr("x", width-1200)
  .attr("y", 200)
  .attr("text-anchor", "middle")
  .attr("class", "chart-title")
  .style("font-size", "30px")
 
  .text("物理集群");

svg.append("text")
  .attr("x", width-1200)
  .attr("y", 1300)
  .attr("text-anchor", "middle")
  .attr("class", "chart-title")
  .style("font-size", "30px")
  
  .text("社会集群");
svg.append("text")
  .attr("x", width+400)
  .attr("y", 800)
  .attr("text-anchor", "middle")
  .attr("class", "chart-title")
  .style("font-size", "30px")
 
  .text("自然集群");
// 添加图例
const legend = svg.append("g")
  .attr("class", "legend")
  .attr("transform", `translate(1800, 80)`);

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
  
  showChart('svg-high');
  document.querySelector('.btn-group button').classList.add('active');


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
    const median = d3.median(values);
    const q1 = d3.quantile(values, 0.25);
    const q3 = d3.quantile(values, 0.75);

    summaryData.push({
      key,
      income: group.income,
      incomeLabel: incomeLabels[group.income],
      period: group.period,
      median,
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

  // 中位数点
  svg.selectAll("circle.median")
    .data(summaryData)
    .enter()
    .append("circle")
    .attr("class", "median")
    .attr("cx", d => x(d.median))
    .attr("cy", d => y(`${d.incomeLabel} ${d.period}`))
    .attr("r", 6)
    .attr("fill", d => colorScale(+d.period.split("-")[0]))
    .attr("stroke", "")
    .attr("stroke-width", 1.5);

  // 添加图表轴
  svg.append("text")
    .attr("x", width-15)
    .attr("y", 520)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .style("font-size", "14px")
    .text("学科多样性");
  svg.append("text")
    .attr("x", -20)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .style("font-size", "14px")
    
    .text("收入类型与时间段");
    svg.append("text")
    .attr("x", width/2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .style("font-size", "20px")
    
    .text("收入类型与学科多样性关系");
    svg.append("text")
    .attr("x", width-40)
    .attr("y", 200)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .style("font-size", "14px")
    
    .text("圆点表示中位数，");
    svg.append("text")
    .attr("x", width-40)
    .attr("y", 220)
    .attr("text-anchor", "middle")
    .attr("class", "chart-title")
    .style("font-size", "14px")
    
    .text("横线两端表示四分位数");

}
drawIncomePeriodSummaryScatter(); // 使用汇总图

function drawScatterWithFit(economicData, countryname, indicatorKey, containerSelector) {
  const tooltip = d3.select("#node-info").style("display", "none").html("");

  let selectedCountry = null;


  // 构建一个 Map：Country + Year -> 经济数据值
  const econMap = {};
  economicData.forEach(d => {
    const country = d[countryname];
    const year = +d.Year;
    const value = +d[indicatorKey];
    if (country && !isNaN(year) && !isNaN(value)) {
      econMap[`${country}_${year}`] = value;
    }
  });

  // 合并数据
  const merged = papersData_diversity.map(d => {
    const country = d.Country;
    const year = +d.Year;
    const diversity = +d.Diversity;
    const econValue = econMap[`${country}_${year}`];

    if (!country || isNaN(diversity) || isNaN(econValue)) return null;

    return {
      country,
      year,
      diversity,
      econValue
    };
  }).filter(d => d !== null);

  if (merged.length === 0) {
    console.warn("没有有效数据用于绘图");
    return;
  }

  // 设置尺寸
  const margin = { top: 30, right: 50, bottom: 60, left: 100 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  d3.select(containerSelector).html(""); // 清空画布

  const svg = d3.select(containerSelector).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // 横轴：Diversity
  const x = d3.scaleLinear()
    .domain(d3.extent(merged, d => d.diversity))
    .nice()
    .range([0, width]);

  // 纵轴：经济指标值
  const y = d3.scaleLinear()
    .domain(d3.extent(merged, d => d.econValue))
    .nice()
    .range([height, 0]);

  // 年份颜色比例尺
  const yearExtent = d3.extent(merged, d => d.year);
  const colorScale = d3.scaleSequential()
    .domain(yearExtent)
    .interpolator(d3.interpolateBlues);

  // 坐标轴
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .call(d3.axisLeft(y));

  // 坐标轴标签
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .text("Diversity");

  svg.append("text")
    .attr("transform", "rotate(0)")
    .attr("x", -10)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .text(`${indicatorKey}`);

  // 散点图：颜色随年份变化
  let selected = null;

svg.selectAll(".dot")
  .data(merged)
  .enter()
  .append("circle")
  .attr("class", "dot")
  .attr("cx", d => x(d.diversity))
  .attr("cy", d => y(d.econValue))
  .attr("r", 4)
  .attr("data-country", d => d.country)  // 👈 绑定国家名
  .attr("fill", d => colorScale(d.year))
  .attr("opacity", 0.7)
  .style("cursor", "pointer")
  .on("click", function(event, d) {
  selectedCountry = (selectedCountry === d.country) ? null : d.country;

  svg.selectAll(".dot")
    .transition().duration(300)
    .attr("fill", p =>
      !selectedCountry || p.country === selectedCountry
        ? colorScale(p.year)
        : "#ccc"
    )
    .attr("opacity", p =>
      !selectedCountry || p.country === selectedCountry
        ? 0.9
        : 0.2
    );

  if (selectedCountry) {
    const countryData = merged
      .filter(p => p.country === d.country)
      .sort((a, b) => a.year - b.year);

    const rows = countryData.map(p =>
      `<tr>
        <td style="padding-right: 16px;">${p.year}</td>
        <td style="padding-right: 16px;">${p.econValue.toFixed(2)}</td>
        <td style="padding-right: 16px;">${p.diversity.toFixed(2)}</td>
      </tr>`
    ).join("");

    tooltip
      .style("display", "block")
      .style("left", "830px")  // 或使用 svgBBox.right + 20
      .style("top", "1850px")
      .html(`
        <strong>${d.country}</strong>
        <table style="margin-top:10px; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr>
              <th align="left">Year</th>
              <th align="left">${indicatorKey}</th>
              <th align="left">Diversity</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `);
  } else {
    tooltip.style("display", "none");
  }
});





d3.select(containerSelector + " svg")
  .on("click", function(event) {
    if (event.target.tagName !== "circle") {
      selectedCountry = null;
      svg.selectAll(".dot")
        .transition().duration(300)
        .attr("fill", d => colorScale(d.year))
        .attr("opacity", 0.7);
      tooltip.style("display", "none");
    }
  });



  // 拟合线
  const regression = d3.regressionLinear()
    .x(d => d.diversity)
    .y(d => d.econValue);

  const lineData = regression(merged);

  const line = d3.line()
    .x(d => x(d[0]))
    .y(d => y(d[1]));

  svg.append("path")
    .datum(lineData)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 2)
    .attr("d", line);

  // 标题
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .attr("font-size", "16px")
    .text(`Diversity vs ${indicatorKey}`);
}



drawScatterWithFit(economicData_GDP,"Country Name", "GDP_WB", "#scatterPlot_GDP");
drawScatterWithFit(economicData_PPP, "Country","GDP_PPP_CI", "#scatterPlot_PPP");
drawScatterWithFit(economicData_ECI,"Country", "ECI", "#scatterPlot_ECI");

showScatter('GDP');

//document.querySelector(".scatter-btn-group button").classList.add("active");
}

function showChart(id) {

  document.querySelectorAll('.chart-svg').forEach(svg => svg.classList.remove('active'));
  const selected = document.getElementById(id);
  if (selected) {
    selected.classList.add('active');
  }
  document.querySelectorAll('.btn-group button').forEach(btn => btn.classList.remove('active'));
  const buttons = {
    'svg-high': 0,
    'svg-upper-middle': 1,
    'svg-lower-middle': 2,
    'svg-low': 3
  };
  const btnGroup = document.querySelectorAll('.btn-group button');
  const index = buttons[id];
  if (btnGroup[index]) {
    btnGroup[index].classList.add('active');
  }
}
function showScatter(type) {
  // 隐藏所有图 & 重置状态
  // 切换图表可见性
  d3.select("#node-info").style("display", "none").html("");
  document.querySelectorAll('.scatter-chart').forEach(div => {
    div.classList.remove('active');
    const svg = div.querySelector('svg');
    
    const colorScale = d3.scaleSequential()
    .domain([1990,2017])
    .interpolator(d3.interpolateBlues);
    
       
    if (svg) {
      
      d3.select(svg).selectAll(".dot")
      
        .attr("fill", d => colorScale(d.year))
        //.attr("fill", d => d3.interpolateBlues((d.year - 2000) / 25))  // 你用的颜色scale
        .attr("opacity", 0.7);  // 默认透明度
    }
  });
  
  document.getElementById(`scatterPlot_${type}`).classList.add("active");

  // 切换按钮高亮
  document.querySelectorAll("#scatter-btn-group button").forEach(btn => btn.classList.remove("active"));
  const buttons = {
    GDP: 0,
    PPP: 1,
    ECI: 2
  };
  document.querySelectorAll("#scatter-btn-group button")[buttons[type]].classList.add("active");
  // ✅ 隐藏 tooltip
  d3.select("#node-info").style("display", "none").html("");


  // ✅ 重置选中状态（如果你用了全局变量）
  if (typeof selectedCountry !== "undefined") {
    selectedCountry = null;
  }
 

}




document.addEventListener("DOMContentLoaded", function () {
  const btnGeographic = document.getElementById('btnGeographic');
  const btnEconomic = document.getElementById('btnEconomic');
  const sectionGeographic = document.getElementById('geographic-corr');
  const sectionEconomic = document.getElementById('economic-corr');

  // 添加按钮高亮切换逻辑
  function setActiveButton(activeBtn) {
    d3.select("#node-info").style("display", "none").html("");
    document.querySelectorAll('.button-container button').forEach(btn => {
      btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
    d3.select("#node-info").style("display", "none").html("");
  }

  function showSection(sectionId) {
    [sectionGeographic, sectionEconomic].forEach(sec => sec.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
  }

  btnGeographic.addEventListener('click', () => {
    setActiveButton(btnGeographic);
    showSection('geographic-corr');
    if (isGeographicLoaded) {
      drawGeographic();
    } else {
      console.log("数据仍在加载中，请稍等...");
    }
  });

  btnEconomic.addEventListener('click', () => {
    setActiveButton(btnEconomic);
    showSection('economic-corr');
    drawEconomic();
  });

  // 默认激活地理按钮
  setActiveButton(btnGeographic);
  showSection('geographic-corr');

  // 加载所有数据
  loadPapers();
  loadEconomic();
  loadGeographic(drawGeographic());
});
