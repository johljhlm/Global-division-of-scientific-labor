import { drawGDPChart } from './gdp.js';
import { drawPPPChart } from './ppp.js';
import { drawECIChart } from './eci.js';
import { drawIncomeGroupChart } from './income.js';
import { drawBarChart } from './rca.js';

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
let gdpData, pppData, eciData, incomeData, rcaData;
let currentChart = null;

// 处理RCA数据的函数
function processRCAData(raw) {
    const specialtyMap = {};

    // 分组：将数据按 level_3（学科）分类
    raw.forEach(d => {
        const country = d.Country;
        const specialty = d.level_3;
        const rca = +d.RCA_Specialty;

        // 跳过非法或缺失数据
        if (!specialty || !country || isNaN(rca)) return;

        if (!specialtyMap[specialty]) {
            specialtyMap[specialty] = [];
        }

        specialtyMap[specialty].push({ country, rca });
    });

    // 获取每个学科RCA最高的前5国家
    const top5BySpecialty = {};
    Object.entries(specialtyMap).forEach(([specialty, entries]) => {
        const sorted = entries.sort((a, b) => b.rca - a.rca).slice(0, 5);
        top5BySpecialty[specialty] = sorted;
    });

    // 映射HTML容器ID
    const mapping = {
        "Arts and Humanities": "#arts-chart",
        "Engineering": "#eng-chart",
        "Social Sciences": "#soc-chart",
        "Natural Sciences": "#nat-chart",
        "Medical Sciences": "#med-chart"
    };

    // 绘图
    for (const [specialty, containerId] of Object.entries(mapping)) {
        if (top5BySpecialty[specialty]) {
            drawBarChart(top5BySpecialty[specialty], specialty, containerId);
        }
    }
}

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function () {
    // 加载所有数据
    Promise.all([
        d3.csv('../data/data_gdp_clean_long.csv'),
        d3.csv('../data/GDP_PPP_CI.csv'),
        d3.csv('../data/ECI_Ranking.csv'),
        d3.csv('../data/income_group.csv'),
        d3.csv('../data/RCA.csv')
    ]).then(([gdp, ppp, eci, income, rca]) => {
        gdpData = gdp;
        pppData = ppp;
        eciData = eci;
        incomeData = income;
        rcaData = rca;

        // 添加调试信息
        console.log('PPP data sample:', pppData[0]);

        // 默认显示GDP图表
        drawEconomicChart('gdp');

        // 处理RCA数据并绘制图表
        processRCAData(rcaData);

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