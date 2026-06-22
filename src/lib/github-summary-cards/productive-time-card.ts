import * as d3 from 'd3';
import { SummaryCard } from './card';
import type { SummaryCardTheme } from './card';

interface HourContrib {
  hour: number;
  contributions: number;
}

export function generateProductiveTimeCard(
  theme: SummaryCardTheme,
  utcOffset: number,
  hourlyData: HourContrib[],
): string {
  const card = new SummaryCard(`Commits (UTC ${utcOffset >= 0 ? '+' : ''}${utcOffset})`, 340, 200, theme);
  const svg = card.svg;

  const maxVal = Math.max(...hourlyData.map((d) => d.contributions), 1);
  const barWidth = 10;
  const gap = 2;
  const chartWidth = hourlyData.length * (barWidth + gap);
  const chartHeight = 100;
  const chartX = 0;
  const chartY = 20;

  const xScale = d3
    .scaleBand<number>()
    .domain(hourlyData.map((d) => d.hour))
    .range([0, chartWidth])
    .padding(0.15);

  const yScale = d3
    .scaleLinear()
    .domain([0, maxVal * 1.1])
    .range([chartHeight, 0]);

  const chartGroup = svg
    .append('g')
    .attr('transform', `translate(${chartX}, ${chartY})`);

  chartGroup
    .selectAll<SVGRectElement, HourContrib>('rect')
    .data(hourlyData)
    .enter()
    .append('rect')
    .attr('x', (d) => xScale(d.hour)!)
    .attr('y', (d) => yScale(d.contributions))
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => chartHeight - yScale(d.contributions))
    .attr('fill', theme.chart)
    .attr('rx', 2)
    .attr('ry', 2);

  const bottomAxis = d3
    .axisBottom(xScale)
    .tickValues([0, 6, 12, 18, 23])
    .tickFormat((d) => `${d}`);

  chartGroup
    .append('g')
    .attr('transform', `translate(0, ${chartHeight})`)
    .call(bottomAxis)
    .selectAll('text')
    .style('font-size', '10px')
    .style('fill', theme.text);

  svg
    .append('text')
    .attr('x', chartWidth / 2)
    .attr('y', chartHeight + 45)
    .attr('text-anchor', 'middle')
    .style('font-size', '11px')
    .style('fill', theme.text)
    .text('per day hour');

  return card.toString();
}
