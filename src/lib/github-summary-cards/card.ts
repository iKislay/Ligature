import { JSDOM } from 'jsdom';
import * as d3 from 'd3';

export interface SummaryCardTheme {
  title: string;
  text: string;
  background: string;
  stroke: string;
  strokeOpacity: number;
  icon: string;
  chart: string;
}

export class SummaryCard {
  private body: d3.Selection<HTMLBodyElement, unknown, null, undefined>;
  public svg: d3.Selection<SVGGElement, unknown, null, undefined>;
  protected width: number;
  protected height: number;
  protected theme: SummaryCardTheme;
  protected xPadding = 25;

  constructor(title: string, width: number, height: number, theme: SummaryCardTheme) {
    this.width = width;
    this.height = height;
    this.theme = theme;

    const fakeDom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    this.body = d3.select(fakeDom.window.document).select('body');

    const root = this.body.append('div').attr('class', 'container');

    const svg = root
      .append('svg')
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);

    svg
      .append('style')
      .text(`* { font-family: 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; }`);

    svg
      .append('rect')
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', this.theme.background)
      .attr('stroke', this.theme.stroke)
      .attr('stroke-opacity', this.theme.strokeOpacity)
      .attr('stroke-width', 1);

    if (title) {
      svg
        .append('text')
        .attr('x', this.xPadding)
        .attr('y', 30)
        .style('font-size', '22px')
        .style('fill', this.theme.title)
        .text(title);
    }

    this.svg = svg
      .append('g')
      .attr('transform', 'translate(0, 40)') as unknown as d3.Selection<SVGGElement, unknown, null, undefined>;
  }

  appendIcon(
    container: d3.Selection<SVGGElement, unknown, null, undefined>,
    path: string,
    x: number,
    y: number,
  ) {
    container
      .append('g')
      .attr('transform', `translate(${x}, ${y})`)
      .attr('fill', this.theme.icon)
      .html(path);
  }

  toString(): string {
    return this.body.select('.container').html();
  }
}
