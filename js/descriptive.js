import { drawGDPChart } from './gdp.js';
import { drawPPPChart } from './ppp.js';
import { drawECIChart } from './eci.js';
import { drawIncomeGroupChart } from './income.js';
import { loadAndProcessData } from './rca.js';

// Make navigateTo function globally available
window.navigateTo = function (type) {
    const economic = document.getElementById("economic-section");
    const historical = document.getElementById("historical-section");

    if (type === "economic") {
        economic.style.display = "block";
        historical.style.display = "none";
    } else if (type === "historical") {
        economic.style.display = "none";
        historical.style.display = "block";
    }
}

// 全局变量存储数据
let gdpData, pppData, eciData, incomeData;
let currentChart = null;

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function () {
    // 加载所有数据
    Promise.all([
        d3.csv('../data/data_gdp_clean_long.csv'),
        d3.csv('../data/GDP_PPP_CI.csv'),
        d3.csv('../data/ECI_Ranking.csv'),
        d3.csv('../data/income_group.csv')
    ]).then(([gdp, ppp, eci, income]) => {
        gdpData = gdp;
        pppData = ppp;
        eciData = eci;
        incomeData = income;

        // 添加调试信息
        console.log('PPP data sample:', pppData[0]);

        // 默认显示GDP图表
        drawEconomicChart('gdp');

        // 添加按钮点击事件监听
        document.querySelectorAll('.indicator-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 更新按钮状态
                document.querySelectorAll('.indicator-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');

                // 绘制相应的图表
                drawEconomicChart(e.target.dataset.indicator);
            });
        });
    }).catch(error => {
        console.error('Error loading data:', error);
    });
});

function drawEconomicChart(indicator) {
    // 清除现有图表
    const container = d3.select('#economic-chart');
    container.selectAll('*').remove();

    switch (indicator) {
        case 'gdp':
            drawGDPChart(gdpData);
            break;
        case 'ppp':
            drawPPPChart(pppData);
            break;
        case 'eci':
            drawECIChart(eciData);
            break;
        case 'income':
            drawIncomeGroupChart(incomeData);
            break;
    }
}

// 初始化执行
loadAndProcessData();