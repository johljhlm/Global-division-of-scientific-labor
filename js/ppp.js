export function drawPPPChart(data) {
    if (!data) return;

    // 清除现有的图表
    const container = d3.select('#economic-chart');
    container.selectAll('*').remove();
    container.style('height', '500px');

    const width = container.node().clientWidth || 700;
    const height = container.node().clientHeight || 400;
    const margin = { top: 30, right: 120, bottom: 40, left: 70 };

    // 定义默认高亮的国家
    const highlightCountries = ["Qatar", "Macao SAR, China", "Luxembourg", "Singapore", "Brunei Darussalam"];

    // 重新组织数据结构
    let processedData = [];

    // 处理所有年份的数据
    data.forEach(d => {
        const country = d["Country Name"];
        for (let year = 1990; year <= 2018; year++) {
            const value = +d[year];
            if (!isNaN(value) && value > 0) {
                processedData.push({
                    "Country Name": country,
                    "Year": year,
                    "GDP per capita, PPP (current international $)": value
                });
            }
        }
    });

    // 按国家分组数据
    const groupedData = d3.group(processedData, d => d["Country Name"]);

    // 创建SVG
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('display', 'block')
        .style('margin', '0 auto')
        .style('overflow', 'visible');

    // 设置比例尺
    const x = d3.scaleLinear()
        .domain([1990, 2018])
        .range([margin.left, width - margin.right]);

    const maxPPP = d3.max(processedData, d => +d["GDP per capita, PPP (current international $)"]);
    const y = d3.scaleLinear()
        .domain([0, maxPPP])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // 创建线条生成器
    const line = d3.line()
        .x(d => x(+d.Year))
        .y(d => y(+d["GDP per capita, PPP (current international $)"]))
        .defined(d => !isNaN(d["GDP per capita, PPP (current international $)"]) &&
            d["GDP per capita, PPP (current international $)"] > 0);

    // 绘制坐标轴
    const xAxis = g => g
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d3.format('d')));

    const yAxis = g => g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(6).tickFormat(d => (d / 1000).toFixed(1)));

    svg.append('g').call(xAxis);
    svg.append('g').call(yAxis);

    // 添加标题和标签
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', width / 2)
        .attr('y', margin.top - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('各国/地区人均GDP(PPP)变化折线图');

    svg.append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', margin.left - 60)
        .attr('x', -(height / 2))
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('人均GDP(PPP)（千美元）');

    svg.append('text')
        .attr('class', 'x-axis-label')
        .attr('x', width / 2)
        .attr('y', height - margin.bottom + 40)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('年份');

    // 设置颜色比例尺
    const color = d3.scaleOrdinal(d3.schemeTableau10)
        .domain(highlightCountries);

    // 创建一个用于显示国家名称的标签组
    const labelGroup = svg.append('g')
        .attr('class', 'labels-group');

    // 绘制线条
    const linesGroup = svg.append('g')
        .attr('class', 'lines-group');

    // 首先绘制所有线条
    const lines = linesGroup.selectAll('path.line')
        .data(Array.from(groupedData.keys()))
        .join('path')
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke-width', d => highlightCountries.includes(d) ? 3 : 1.5)
        .attr('stroke', d => highlightCountries.includes(d) ? color(d) : '#ccc')
        .attr('opacity', d => highlightCountries.includes(d) ? 1 : 0.3)
        .attr('d', country => {
            const countryData = groupedData.get(country);
            countryData.sort((a, b) => +a.Year - +b.Year);
            return line(countryData);
        });

    // 添加透明的宽线条用于更容易的鼠标交互
    const hoverLines = linesGroup.selectAll('path.hover-area')
        .data(Array.from(groupedData.keys()))
        .join('path')
        .attr('class', 'hover-area')
        .attr('fill', 'none')
        .attr('stroke', 'transparent')
        .attr('stroke-width', 10)
        .attr('d', country => {
            const countryData = groupedData.get(country);
            countryData.sort((a, b) => +a.Year - +b.Year);
            return line(countryData);
        })
        .style('cursor', 'pointer')
        .on('mouseover', function (event, country) {
            // 高亮选中的线条
            lines
                .attr('stroke', d => d === country ? (highlightCountries.includes(d) ? color(d) : '#000') : (highlightCountries.includes(d) ? color(d) : '#ccc'))
                .attr('opacity', d => d === country ? 1 : (highlightCountries.includes(d) ? 0.8 : 0.2))
                .attr('stroke-width', d => d === country ? 3 : (highlightCountries.includes(d) ? 3 : 1.5));

            // 更新标签
            labelGroup.selectAll('text').remove();
            const countryData = groupedData.get(country);
            countryData.sort((a, b) => +a.Year - +b.Year);
            const lastPoint = countryData[countryData.length - 1];

            if (lastPoint) {
                const value = +lastPoint["GDP per capita, PPP (current international $)"];
                if (!isNaN(value) && value > 0) {
                    labelGroup.append('text')
                        .attr('x', x(+lastPoint.Year) + 5)
                        .attr('y', y(value))
                        .text(`${country} (${(value / 1000).toFixed(1)}k)`)
                        .attr('fill', highlightCountries.includes(country) ? color(country) : '#000')
                        .style('font-weight', 'bold')
                        .style('font-size', '12px');
                }
            }
        })
        .on('mouseout', function () {
            // 恢复原始状态
            lines
                .attr('stroke', d => highlightCountries.includes(d) ? color(d) : '#ccc')
                .attr('opacity', d => highlightCountries.includes(d) ? 1 : 0.3)
                .attr('stroke-width', d => highlightCountries.includes(d) ? 3 : 1.5);

            // 恢复原始标签
            updateHighlightLabels();
        });

    // 更新高亮国家的标签
    function updateHighlightLabels() {
        labelGroup.selectAll('text').remove();
        highlightCountries.forEach(country => {
            const countryData = groupedData.get(country);
            if (!countryData) return;

            countryData.sort((a, b) => +a.Year - +b.Year);
            const lastPoint = countryData[countryData.length - 1];

            if (lastPoint) {
                const value = +lastPoint["GDP per capita, PPP (current international $)"];
                if (!isNaN(value) && value > 0) {
                    labelGroup.append('text')
                        .attr('x', x(+lastPoint.Year) + 5)
                        .attr('y', y(value))
                        .text(`${country} (${(value / 1000).toFixed(1)}k)`)
                        .attr('fill', color(country))
                        .style('font-weight', 'bold')
                        .style('font-size', '12px');
                }
            }
        });
    }

    // 初始显示高亮国家的标签
    updateHighlightLabels();
} 