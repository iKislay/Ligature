import * as d3 from 'd3';
import { SummaryCard } from './card';
import type { SummaryCardTheme } from './card';

interface DonutEntry {
  label: string;
  value: number;
  color: string;
}

export function generateDonutChartCard(
  title: string,
  theme: SummaryCardTheme,
  data: DonutEntry[],
): string {
  const card = new SummaryCard(title, 340, 200, theme);
  const svg = card.svg;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = 50;
  const legendX = 150;

  const pie = d3.pie<DonutEntry>().value((d) => d.value).sort(null);
  const pieData = pie(data);

  const arc = d3.arc<d3.PieArcDatum<DonutEntry>>()
    .outerRadius(radius - 5)
    .innerRadius(radius / 2);

  const chartGroup = svg
    .append('g')
    .attr('transform', `translate(70, 75)`);

  chartGroup
    .selectAll<SVGPathElement, d3.PieArcDatum<DonutEntry>>('path')
    .data(pieData)
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', (d) => d.data.color)
    .attr('stroke', theme.background)
    .attr('stroke-width', 1);

  if (total > 0) {
    chartGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 5)
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .style('fill', theme.text)
      .text(total);
  }

  const legend = svg
    .append('g')
    .attr('transform', `translate(${legendX}, 10)`);

  data.slice(0, 5).forEach((entry, index) => {
    const y = index * 22;

    legend
      .append('rect')
      .attr('x', 0)
      .attr('y', y)
      .attr('width', 12)
      .attr('height', 12)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('fill', entry.color);

    legend
      .append('text')
      .attr('x', 20)
      .attr('y', y + 11)
      .style('font-size', '12px')
      .style('fill', theme.text)
      .text(`${entry.label} ${entry.value}`);
  });

  if (data.length > 5) {
    const others = data.slice(5).reduce((sum, d) => sum + d.value, 0);
    const y = 5 * 22;

    legend
      .append('text')
      .attr('x', 0)
      .attr('y', y + 11)
      .style('font-size', '12px')
      .style('fill', theme.text)
      .text(`Others ${others}`);
  }

  return card.toString();
}
