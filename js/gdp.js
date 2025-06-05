export function drawGDPChart(data) {
    if (!data) return;

    const container = d3.select('#economic-chart');
    container.selectAll('*').remove();
    container.style('height', '500px');

    const width = container.node().clientWidth || 700;
    const height = container.node().clientHeight || 400;
    const margin = { top: 30, right: 120, bottom: 40, left: 70 };

    // 处理数据
    const processedData = d3.group(data, d => d["Country Name"]);
    const countries = Array.from(processedData.keys());
    const highlightCountries = ["United States", "China", "Japan", "Germany", "United Kingdom"];

    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('display', 'block')
        .style('margin', '0 auto')
        .style('overflow', 'visible');

    // 设置比例尺
    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.Year))
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => +d.GDP_WB)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    // 创建线条生成器
    const line = d3.line()
        .x(d => x(+d.Year))
        .y(d => y(+d.GDP_WB))
        .defined(d => !isNaN(d.GDP_WB) && d.GDP_WB !== null && d.GDP_WB !== "");

    // 绘制坐标轴
    const xAxis = g => g
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d3.format('d')));

    const yAxis = g => g
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(6).tickFormat(d => (d / 1e9).toFixed(0)));

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
        .text('各国/地区GDP变化折线图');

    svg.append('text')
        .attr('class', 'y-axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', margin.left - 60)
        .attr('x', -(height / 2))
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('GDP（十亿美元）');

    svg.append('text')
        .attr('class', 'x-axis-label')
        .attr('x', width / 2)
        .attr('y', height - margin.bottom + 40)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('年份');

    // 设置颜色比例尺
    const color = d3.scaleOrdinal(d3.schemeTableau10)
        .domain(countries);

    // 创建一个用于显示国家名称的标签组
    const labelGroup = svg.append('g')
        .attr('class', 'labels-group');

    // 绘制线条
    const linesGroup = svg.append('g')
        .attr('class', 'lines-group');

    // 首先绘制所有线条
    const lines = linesGroup.selectAll('path.line')
        .data(countries)
        .join('path')
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke-width', d => highlightCountries.includes(d) ? 3 : 1.5)
        .attr('stroke', d => highlightCountries.includes(d) ? color(d) : '#ccc')
        .attr('opacity', d => highlightCountries.includes(d) ? 1 : 0.3)
        .attr('d', country => {
            const countryData = processedData.get(country);
            countryData.sort((a, b) => +a.Year - +b.Year);
            return line(countryData);
        });

    // 添加透明的宽线条用于更容易的鼠标交互
    const hoverLines = linesGroup.selectAll('path.hover-area')
        .data(countries)
        .join('path')
        .attr('class', 'hover-area')
        .attr('fill', 'none')
        .attr('stroke', 'transparent')
        .attr('stroke-width', 10)
        .attr('d', country => {
            const countryData = processedData.get(country);
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
            const countryData = processedData.get(country);
            countryData.sort((a, b) => +a.Year - +b.Year);
            const lastPoint = countryData[countryData.length - 1];

            if (lastPoint) {
                labelGroup.append('text')
                    .attr('x', x(+lastPoint.Year) + 5)
                    .attr('y', y(+lastPoint.GDP_WB))
                    .text(`${country} (${(+lastPoint.GDP_WB / 1e9).toFixed(0)}B)`)
                    .attr('fill', highlightCountries.includes(country) ? color(country) : '#000')
                    .style('font-weight', 'bold')
                    .style('font-size', '12px');
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
            const countryData = processedData.get(country);
            if (!countryData) return;

            countryData.sort((a, b) => +a.Year - +b.Year);
            const lastPoint = countryData[countryData.length - 1];

            if (lastPoint) {
                labelGroup.append('text')
                    .attr('x', x(+lastPoint.Year) + 5)
                    .attr('y', y(+lastPoint.GDP_WB))
                    .text(`${country} (${(+lastPoint.GDP_WB / 1e9).toFixed(0)}B)`)
                    .attr('fill', color(country))
                    .style('font-weight', 'bold')
                    .style('font-size', '12px');
            }
        });
    }

    // 初始显示高亮国家的标签
    updateHighlightLabels();
} 