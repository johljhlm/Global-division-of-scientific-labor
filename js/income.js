function drawIncomeGroupChart(data) {
    if (!data) return;

    const container = d3.select('#economic-chart');
    container.selectAll('*').remove();
    container.style('height', '500px')
        .style('display', 'flex')
        .style('flex-direction', 'column')
        .style('align-items', 'center');

    // 将宽格式数据转换为长格式
    const years = Object.keys(data[0]).filter(key => !isNaN(key));
    let longFormatData = [];

    data.forEach(row => {
        years.forEach(year => {
            if (row[year] && row[year] !== '..') {
                longFormatData.push({
                    country: row.Code,
                    year: year,
                    incomeGroup: row[year]
                });
            }
        });
    });

    // 获取所有可用的年份并倒序排列
    const availableYears = Array.from(new Set(longFormatData.map(d => d.year)))
        .sort((a, b) => b - a);

    // 设置饼图的尺寸
    const width = container.node().clientWidth || 800;
    const height = 350;  // 调整图表高度
    const radius = Math.min(width, height) / 2.5;

    // 定义颜色比例尺
    const color = d3.scaleOrdinal()
        .domain(['H', 'UM', 'LM', 'L'])
        .range(['#2ecc71', '#3498db', '#e67e22', '#e74c3c']);

    // 添加年份选择器
    const controlsDiv = container.append('div')
        .style('text-align', 'center')
        .style('margin', '10px 0');

    controlsDiv.append('label')
        .text('选择年份: ')
        .style('margin-right', '10px');

    const yearSelect = controlsDiv.append('select')
        .style('padding', '5px')
        .style('font-size', '14px')
        .on('change', function () {
            updateChart(this.value);
        });

    yearSelect.selectAll('option')
        .data(availableYears)
        .enter()
        .append('option')
        .text(d => d)
        .attr('value', d => d);

    // 创建图例容器 - 移到最上方
    const legendContainer = container.append('div')
        .style('text-align', 'center')
        .style('margin', '10px auto')
        .style('padding', '10px')
        .style('max-width', '600px');

    // 创建图例
    const legend = legendContainer.append('div')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('flex-wrap', 'wrap')
        .style('gap', '20px');

    const legendItems = legend.selectAll('.legend-item')
        .data([
            { key: 'H', label: 'High income' },
            { key: 'UM', label: 'Upper middle income' },
            { key: 'LM', label: 'Lower middle income' },
            { key: 'L', label: 'Low income' }
        ])
        .enter()
        .append('div')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('margin', '5px 10px');

    legendItems.append('div')
        .style('width', '12px')
        .style('height', '12px')
        .style('margin-right', '5px')
        .style('background-color', d => color(d.key));

    legendItems.append('span')
        .text(d => d.label);

    // 添加标题
    container.append('div')
        .style('text-align', 'center')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .style('margin', '10px 0')
        .text('各收入组国家/地区数量分布');

    // 创建SVG容器
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('display', 'block')
        .style('margin', '0 auto')
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2 - 30})`);  // 向上移动30个像素

    // 创建饼图生成器
    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius - 40);

    // 创建标签弧线
    const labelArc = d3.arc()
        .innerRadius(radius - 40)
        .outerRadius(radius - 40);

    // 更新图表的函数
    function updateChart(selectedYear) {
        // 处理数据
        const yearData = longFormatData.filter(d => d.year === selectedYear);

        // 统计每个收入组的数量
        const groupCounts = d3.rollup(yearData,
            v => v.length,
            d => d.incomeGroup
        );

        const pieData = Array.from(groupCounts, ([key, value]) => ({
            category: key,
            count: value
        }));

        // 清除现有的路径
        svg.selectAll('*').remove();

        // 创建新的路径
        const arcs = svg.selectAll('path')
            .data(pie(pieData))
            .enter()
            .append('g');

        arcs.append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.category))
            .attr('stroke', 'white')
            .style('stroke-width', '2px')
            .style('opacity', 0.8)
            .on('mouseover', function () {
                d3.select(this)
                    .style('opacity', 1);
            })
            .on('mouseout', function () {
                d3.select(this)
                    .style('opacity', 0.8);
            });

        // 添加标签
        arcs.append('text')
            .attr('transform', d => {
                const pos = labelArc.centroid(d);
                return `translate(${pos})`;
            })
            .attr('dy', '0.35em')
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .text(d => `${d.data.count} (${(d.data.count / yearData.length * 100).toFixed(1)}%)`);
    }

    // 初始显示最新年份的数据
    yearSelect.property('value', availableYears[0]);
    updateChart(availableYears[0]);
}

export { drawIncomeGroupChart }; 