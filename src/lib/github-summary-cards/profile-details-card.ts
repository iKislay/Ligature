import * as d3 from 'd3';
import { SummaryCard } from './card';
import type { SummaryCardTheme } from './card';

interface MonthContrib {
  month: string;
  contributions: number;
}

export function generateProfileDetailsCard(
  theme: SummaryCardTheme,
  username: string,
  totalContributions: number,
  monthlyData: MonthContrib[],
): string {
  const card = new SummaryCard('', 700, 200, theme);
  const svg = card.svg;

  svg
    .append('text')
    .attr('x', 0)
    .attr('y', 16)
    .style('font-size', '18px')
    .style('font-weight', 'bold')
    .style('fill', theme.title)
    .text(`${username} (GitHub)`);

  const details = [
    { label: `${totalContributions.toLocaleString()} Contributions`, icon: '★' },
    { label: 'on GitHub', icon: '' },
  ];

  const infoY = 40;
  details.forEach((d, i) => {
    svg
      .append('text')
      .attr('x', 0)
      .attr('y', infoY + i * 20)
      .style('font-size', '13px')
      .style('fill', theme.text)
      .text(`${d.icon} ${d.label}`);
  });

  if (monthlyData.length < 2) return card.toString();

  const chartX = 180;
  const chartWidth = 480;
  const chartHeight = 110;
  const chartY = 15;

  const maxVal = Math.max(...monthlyData.map((d) => d.contributions), 1);

  const xScale = d3
    .scalePoint<string>()
    .domain(monthlyData.map((d) => d.month))
    .range([0, chartWidth]);

  const yScale = d3
    .scaleLinear()
    .domain([0, maxVal * 1.1])
    .range([chartHeight, 0]);

  const areaGenerator = d3
    .area<MonthContrib>()
    .x((d) => xScale(d.month)!)
    .y0(chartHeight)
    .y1((d) => yScale(d.contributions))
    .curve(d3.curveMonotoneX);

  const chartGroup = svg
    .append('g')
    .attr('transform', `translate(${chartX}, ${chartY})`);

  chartGroup
    .append('path')
    .datum(monthlyData)
    .attr('d', areaGenerator)
    .attr('fill', theme.chart)
    .attr('fill-opacity', 0.3)
    .attr('stroke', theme.chart)
    .attr('stroke-width', 2);

  const xAxis = d3.axisBottom(xScale).tickValues(
    monthlyData.filter((_, i) => i % 2 === 0).map((d) => d.month),
  );

  chartGroup
    .append('g')
    .attr('transform', `translate(0, ${chartHeight})`)
    .call(xAxis)
    .selectAll('text')
    .style('font-size', '10px')
    .style('fill', theme.text);

  const yAxis = d3.axisRight(yScale).ticks(3);

  chartGroup
    .append('g')
    .attr('transform', `translate(${chartWidth}, 0)`)
    .call(yAxis)
    .selectAll('text')
    .style('font-size', '10px')
    .style('fill', theme.text);

  return card.toString();
}
